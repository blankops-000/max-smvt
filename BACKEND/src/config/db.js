import { checkSupabase } from "./supabase.js";

const connectDB = async () => checkSupabase();

export default connectDB;
