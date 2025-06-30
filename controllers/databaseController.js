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

// Get or create user
async function createOrGetUser(phoneNumber, displayName = null) {
  try {
    // First, try to find existing user
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", phoneNumber)
      .single();

    if (existingUser) {
      console.log(
        `👤 Found existing user: ${existingUser.display_name || phoneNumber}`
      );
      return existingUser;
    }

    // If user doesn't exist, create new one
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          phone_number: phoneNumber,
          display_name: displayName || phoneNumber,
          total_pages: 0,
          current_streak: 0,
          longest_streak: 0,
          daily_goal: 5,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    console.log(`✨ Created new user: ${newUser.display_name}`);
    return newUser;
  } catch (error) {
    console.error("❌ Error with user:", error.message);
    throw error;
  }
}

// Save Quran log entry
async function saveQuranLog(
  userId,
  action,
  startVerse,
  endVerse,
  pagesCount = 1
) {
  try {
    const { data, error } = await supabase
      .from("quran_logs")
      .insert([
        {
          user_id: userId,
          action: action,
          start_verse: startVerse,
          end_verse: endVerse,
          pages_count: pagesCount,
          log_date: new Date().toISOString().split("T")[0], // Today's date
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log(`💾 Saved log: ${action} ${startVerse}-${endVerse}`);
    return data;
  } catch (error) {
    console.error("❌ Error saving log:", error.message);
    throw error;
  }
}

// Calculate pages from verses (basic estimation)
function calculatePages(startVerse, endVerse) {
  // Simple calculation - you can make this more accurate later
  const [startChapter, startVerse_] = startVerse.split(":").map(Number);
  const [endChapter, endVerse_] = endVerse.split(":").map(Number);

  if (startChapter === endChapter) {
    // Same chapter - rough estimate: 20 verses per page
    return Math.max(1, Math.ceil((endVerse_ - startVerse_ + 1) / 20));
  } else {
    // Different chapters - rough estimate
    return Math.max(1, (endChapter - startChapter + 1) * 2);
  }
}

module.exports = {
  supabase,
  testConnection,
  createOrGetUser,
  saveQuranLog,
  calculatePages,
};
