const DEFAULT_API_URL = "";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_URL = trimTrailingSlash(
  process.env.REACT_APP_API_URL || DEFAULT_API_URL
);
