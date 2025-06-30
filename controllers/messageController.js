// controllers/messageController.js

// Handle incoming messages
async function handleIncomingMessages(messageUpdate, sock) {
  console.log("📤 Message upsert event triggered!");
  const { messages, type } = messageUpdate;

  console.log(`Type: ${type}, Messages count: ${messages.length}`);

  //main message parser
  messages.forEach(async (message) => {
    console.log("📩 Message incoming!");

    // Skip messages sent by me
    if (message.key.fromMe) {
      console.log("⏭️ Skipping my own message");
      return;
    }

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

// Handle different bot commands
async function handleCommands(messageText, from, sock) {
  const text = messageText.toLowerCase();

  // Test responses
  if (text.includes("ping")) {
    console.log("🏓 Sending pong response...");
    await sock.sendMessage(from, { text: "🏓 Pong!" });
  }

  if (text.includes("test reminder")) {
    console.log("🧪 Sending test reminder to group...");
    const { sendTestReminder } = require("./reminderController");
    await sendTestReminder(sock);
  }

  if (text.includes("test")) {
    console.log("✅ Sending test response...");
    await sock.sendMessage(from, { text: "Bot is working! 🤖" });
  }

  // Quran tracking commands (to be expanded)
  if (text.includes("quran")) {
    await sock.sendMessage(from, {
      text: "📖 Masha'Allah! How many pages did you read today?",
    });
  }
}

module.exports = {
  handleIncomingMessages,
  handleCommands,
};
