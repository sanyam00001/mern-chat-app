const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  MESSAGE_SEND: "message:send",
  MESSAGE_NEW: "message:new",
  MESSAGE_ERROR: "message:error",
  CONVERSATION_JOIN: "conversation:join",
  CONVERSATION_UPDATED: "conversation:updated",
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",
  PRESENCE_SNAPSHOT: "presence:snapshot",
  PRESENCE_UPDATE: "presence:update",
};

const userRoom = (userId) => `user:${userId}`;
const conversationRoom = (conversationId) => `conversation:${conversationId}`;

module.exports = {
  SOCKET_EVENTS,
  userRoom,
  conversationRoom,
};
