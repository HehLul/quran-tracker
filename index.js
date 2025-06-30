require("dotenv").config();
// index.js
const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

// Import controllers
const { handleIncomingMessages } = require("./controllers/messageController");
const {
  handleConnectionUpdate,
  handleCredentialsUpdate,
} = require("./controllers/connectionController");

const store = {};
const getMessage = (key) => {
  const { id } = key;
  if (store[id]) return store[id].message;
};

//MAIN FUNCTION
async function WAbot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth"); // To save WA auth, not have to constantly scan qr code

  const sock = makeWASocket({
    auth: state,
    getMessage,
  });

  // Handle connection updates
  sock.ev.on("connection.update", (update) => {
    handleConnectionUpdate(update, WAbot, sock);
  });

  // Save credentials when updated
  sock.ev.on("creds.update", handleCredentialsUpdate(saveCreds));

  // Handle incoming messages
  sock.ev.on("messages.upsert", async (messageUpdate) => {
    await handleIncomingMessages(messageUpdate, sock);
  });
}

// Start the bot
WAbot();
