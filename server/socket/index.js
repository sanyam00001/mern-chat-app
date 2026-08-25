const { Server } = require("socket.io");
const { authenticateSocket } = require("./socketAuth");
const { registerSocketHandlers } = require("./handlers");
const { setIO } = require("./ioInstance");
const { SOCKET_EVENTS, userRoom, conversationRoom } = require("./events");
const {
  addSocket,
  removeSocket,
  filterOnlineUserIds,
} = require("./presence");
const { emitPresenceUpdate } = require("./emitters");
const {
  getUserConversationIds,
  getConversationPartnerIds,
} = require("../services/chatService");

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  setIO(io);
  io.use(authenticateSocket);

  io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
    const userId = socket.user._id.toString();
    const { isNewlyOnline } = addSocket(userId, socket.id);

    socket.join(userRoom(userId));

    const conversations = await getUserConversationIds(userId);
    const partnerIds = getConversationPartnerIds(conversations, userId);

    conversations.forEach((conversation) => {
      socket.join(conversationRoom(conversation._id.toString()));
    });

    socket.emit(SOCKET_EVENTS.PRESENCE_SNAPSHOT, {
      onlineUserIds: filterOnlineUserIds(partnerIds),
    });

    if (isNewlyOnline) {
      emitPresenceUpdate(partnerIds, {
        userId,
        isOnline: true,
      });
    }

    registerSocketHandlers(io, socket);

    socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
      const { isNowOffline } = removeSocket(userId, socket.id);

      if (isNowOffline) {
        const latestConversations = await getUserConversationIds(userId);
        const latestPartnerIds = getConversationPartnerIds(
          latestConversations,
          userId
        );

        emitPresenceUpdate(latestPartnerIds, {
          userId,
          isOnline: false,
        });
      }
    });
  });

  return io;
};

module.exports = {
  initSocket,
};
