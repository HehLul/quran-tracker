// controllers/messageController.js

// READ INCOMING MESSAGES
async function handleIncomingMessages(messageUpdate, sock) {
  console.log("📤 Message upsert event triggered!");
  const { messages, type } = messageUpdate;

  console.log(`Type: ${type}, Messages count: ${messages.length}`);

  //main message parser
  messages.forEach(async (message) => {
    console.log("📩 Message incoming!");

    // Skip if no message content
    if (!message.message) {
      console.log("⏭️ Skipping message with no content");
      return;
    }

    // Extract message info
    const from = message.key.remoteJid;
    const messageText =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      "";

    console.log(`From: ${from}`);
    console.log(`Text: "${messageText}"`);

    // Handle different commands
    await handleCommands(messageText, from, sock);
  });
}

// HANDLE COMMANDS
async function handleCommands(messageText, from, sock) {
  const text = messageText.toLowerCase();

  // Test responses
  if (text.includes("ping")) {
    console.log("🏓 Sending pong response...");
    await sock.sendMessage(from, { text: "🏓 Pong!" });
  }

  // Test Reminder
  if (text.includes("test reminder")) {
    console.log("🧪 Sending test reminder to group...");
    const { sendTestReminder } = require("./reminderController");
    await sendTestReminder(sock);
  }
  // Handle /log command
  if (text.startsWith("/log")) {
    console.log("📖 Processing /log command...");

    // Parse the command: /log revise 9:16 9:48
    const parts = messageText.trim().split(" ");

    if (parts.length === 4) {
      const command = parts[0]; // "/log"
      const action = parts[1].toLowerCase(); // "revise", "read", "memorize"
      const startVerse = parts[2]; // "9:16"
      const endVerse = parts[3]; // "9:48"

      // Valid actions
      const validActions = ["read", "revise", "memorize"];

      // Validate action and verse format
      if (!validActions.includes(action)) {
        await sock.sendMessage(from, {
          text: "❌ Invalid action! Use: read, revise, or memorize\nExample: /log revise 9:16 9:48",
        });
      } else if (startVerse.includes(":") && endVerse.includes(":")) {
        console.log(`📝 Logging: ${action} from ${startVerse} to ${endVerse}`);

        // TODO: Save to database here

        await sock.sendMessage(from, {
          text: `✅ Logged successfully!\n📖 ${action}: ${startVerse} → ${endVerse}\nMasha'Allah! Keep it up! 🤲`,
        });
      } else {
        await sock.sendMessage(from, {
          text: "❌ Invalid format!\n Use: /log [action] [start] [end]\nExample: /log revise 9:16 9:48\n(Chapter:Verse format required)",
        });
      }
    } else {
      await sock.sendMessage(from, {
        text: "❌ Invalid format!\n Use: /log [action] [start] [end]\nExample: /log revise 9:16 9:48\n(Chapter:Verse format required)",
      });
    }
  }
  // Handle /help command
  if (text.startsWith("/help")) {
    console.log("📋 Showing help menu...");

    const helpMessage = `🤖 *QuranTracker Bot Commands*

📖 *Logging Commands:*
- \`/log [action] [start] [end]\` - Log your reading
  Actions: read, revise, memorize
  Example: \`/log revise 9:16 9:48\`

⚙️ *Utility Commands:*
- \`/help\` - Show this menu
- \`/undo\` - Delete your last entry

Barakallahu feek! 🤲`;

    await sock.sendMessage(from, { text: helpMessage });
  }
  //Handle /undo command
  if (text.startsWith("/undo")) {
    console.log("↩️ Processing /undo command...");

    // TODO: Get user's last entry from database and delete it
    // const lastEntry = await getLastUserEntry(userPhoneNumber);
    // if (lastEntry) {
    //   await deleteEntry(lastEntry.id);
    //   // Show what was deleted
    // }

    // For now, placeholder response
    await sock.sendMessage(from, {
      text: "↩️ Undo functionality coming soon!\n\nOnce database is connected, this will:\n• Delete your most recent log entry\n• Show you what was removed\n• Update your stats accordingly",
    });

    // Future implementation will be:
    /*
  const userPhone = message.key.remoteJid.replace('@s.whatsapp.net', '');
  const lastEntry = await getLastUserEntry(userPhone);
  
  if (lastEntry) {
    await deleteLogEntry(lastEntry.id);
    await sock.sendMessage(from, { 
      text: `✅ Undone!\nRemoved: ${lastEntry.action} ${lastEntry.start_verse} → ${lastEntry.end_verse}\nLogged at: ${lastEntry.logged_at}` 
    });
  } else {
    await sock.sendMessage(from, { 
      text: "❌ No recent entries found to undo." 
    });
  }
  */
  }
}

module.exports = {
  handleIncomingMessages,
  handleCommands,
};
