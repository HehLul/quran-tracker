// controllers/databaseController.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count");
    if (error) throw error;
    console.log("✅ Connected to Supabase!");
  } catch (error) {
    console.error("❌ Supabase connection failed:", error.message);
  }
}

module.exports = {
  supabase,
  testConnection,
};
