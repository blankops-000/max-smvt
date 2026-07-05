import express from "express"
import connectDB from "./config/db.js";
import CarRoutes from "./Routes/CarRoutes.js";
import { loginAdmin } from "./auth.js";
import dotenv from "dotenv"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000
const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// CORS middleware
app.use((req, res, next) => {
  const requestOrigin = req.get("Origin");
  const allowAnyOrigin = allowedOrigins.includes("*");
  const allowedOrigin = allowAnyOrigin || !requestOrigin || allowedOrigins.includes(requestOrigin)
    ? (requestOrigin || "*")
    : allowedOrigins[0];

  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Vary', 'Origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.post("/api/auth/login", loginAdmin);

const requireDatabase = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error: process.env.NODE_ENV === "production" ? "Unable to connect to database" : error.message,
    });
  }
};

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Signature Motor Vehicle Traders API is running!',
    endpoints: ['/api/cars', '/api/auth/login', '/test-db'],
    database: 'Supabase',
  });
});

// Test database connection route
app.get('/test-db', async (req, res) => {
  try {
    const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
    const hasSupabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
    await connectDB();
    res.json({ 
      database: 'Connected',
      provider: 'Supabase',
      supabaseUrl: hasSupabaseUrl ? 'Set' : 'Missing',
      supabaseKey: hasSupabaseKey ? 'Set' : 'Missing',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/api/cars", requireDatabase, CarRoutes);

const startServer = () => {
  app.listen(PORT, () => {
    console.log ("Server started on PORT:", PORT);
  });
};

if (process.env.VERCEL !== "1") {
  startServer();
}

// Export for serverless deployment
export default app;
