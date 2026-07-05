const SUPABASE_TABLE = process.env.SUPABASE_CARS_TABLE || "cars";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  return {
    restUrl: `${trimTrailingSlash(url)}/rest/v1`,
    key,
  };
};

const supabaseHeaders = (extraHeaders = {}) => {
  const { key } = getSupabaseConfig();

  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extraHeaders,
  };
};

export const supabaseRequest = async (path, options = {}) => {
  const { restUrl } = getSupabaseConfig();
  const response = await fetch(`${restUrl}/${path}`, {
    ...options,
    headers: supabaseHeaders(options.headers),
  });

  if (!response.ok) {
    const body = await response.text();
    const error = new Error(body || `Supabase request failed with HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const getCarsTable = () => SUPABASE_TABLE;

export const checkSupabase = async () => {
  await supabaseRequest(`${SUPABASE_TABLE}?select=id&limit=1`);
  return true;
};
