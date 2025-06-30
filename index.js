const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const qrcode = require("qrcode-terminal");

const store = {};
const getMessage = (key) => {
  const { id } = key;
  if (store[id]) return store[id].message;
};

async function WAbot() {
  // To save WA auth, not have to constantly scan qr code
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    auth: state,
    getMessage,
  });

  // Handle connection updates
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Display QR code when available
    if (qr) {
      console.log("Scan this QR code with your WhatsApp:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("Connection closed due to:", lastDisconnect.error);

      if (shouldReconnect) {
        console.log("Reconnecting...");
        WAbot();
      }
    } else if (connection === "open") {
      console.log("✅ Connected to WhatsApp!");
    }
  });

  // Save credentials when updated
  sock.ev.on("creds.update", saveCreds);

  // Handle incoming messages - CORRECT VERSION
  sock.ev.on("messages.upsert", async (messageUpdate) => {
    console.log("📤 Message upsert event triggered!");

    // Extract messages from the messageUpdate object
    const { messages, type } = messageUpdate;

    console.log(`Type: ${type}, Messages count: ${messages.length}`);

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

      // Test responses
      if (messageText.toLowerCase().includes("ping")) {
        console.log("🏓 Sending pong response...");
        await sock.sendMessage(from, { text: "🏓 Pong!" });
      }

      if (messageText.toLowerCase().includes("test")) {
        console.log("✅ Sending test response...");
        await sock.sendMessage(from, { text: "Bot is working! 🤖" });
      }
    });
  });
}

WAbot();
