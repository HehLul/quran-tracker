require("dotenv").config();
// controllers/reminderController.js
const cron = require("node-cron");

// Configuration
const GROUP_ID = process.env.WA_GROUP_ID; // Replace with your actual group ID
const REMINDER_TIMES = [
  {
    time: "09:00",
    message:
      "🌅 Good morning! Don't forget to update your Quran reading for today!",
  },
  {
    time: "20:00",
    message: "🌙 Evening reminder: Have you updated your Quran progress today?",
  },
];

// Scheduled reminder function
function startScheduledReminders(sock) {
  console.log("📅 Setting up scheduled reminders...");

  REMINDER_TIMES.forEach(({ time, message }) => {
    // Schedule using cron (minute hour * * *)
    const [hour, minute] = time.split(":");
    const cronTime = `${minute} ${hour} * * *`; // Every day at specified time

    cron.schedule(cronTime, async () => {
      try {
        console.log(`⏰ Sending scheduled reminder at ${time}`);
        await sock.sendMessage(GROUP_ID, { text: message });
        console.log("✅ Reminder sent successfully!");
      } catch (error) {
        console.error("❌ Failed to send reminder:", error);
      }
    });

    console.log(`⏰ Scheduled reminder set for ${time}`);
  });
}

// Manual function to send reminder now (for testing)
async function sendTestReminder(sock) {
  try {
    await sock.sendMessage(GROUP_ID, {
      text: "🧪 Test reminder: This is a test message from your Quran bot!",
    });
    console.log("✅ Test reminder sent!");
  } catch (error) {
    console.error("❌ Failed to send test reminder:", error);
  }
}

// Add new reminder time
function addReminderTime(time, message) {
  REMINDER_TIMES.push({ time, message });
}

// Update group ID
function setGroupId(groupId) {
  GROUP_ID = groupId;
}

module.exports = {
  startScheduledReminders,
  sendTestReminder,
  addReminderTime,
  setGroupId,
  REMINDER_TIMES,
};
