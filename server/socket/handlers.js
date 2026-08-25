const { validateObjectId } = require("../utils/validateChat");
const {
  persistMessage,
  findConversationForUser,
} = require("../services/chatService");
const { SOCKET_EVENTS, conversationRoom } = require("./events");
const { emitNewMessage } = require("./emitters");

const registerSocketHandlers = (io, socket) => {
  const userId = socket.user._id.toString();

  socket.on(SOCKET_EVENTS.CONVERSATION_JOIN, async (payload = {}) => {
    try {
      const conversationId = payload.conversationId;

      validateObjectId(conversationId, "conversation ID");
      await findConversationForUser(conversationId, userId);

      socket.join(conversationRoom(conversationId));
    } catch (error) {
      socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
        message: error.message || "Unable to join conversation",
      });
    }
  });

  socket.on(SOCKET_EVENTS.MESSAGE_SEND, async (payload = {}) => {
    try {
      const { conversationId, content } = payload;
      const { message, conversation } = await persistMessage({
        conversationId,
        userId,
        content,
      });

      emitNewMessage(message, conversation);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.MESSAGE_ERROR, {
        message: error.message || "Failed to send message",
      });
    }
  });

  socket.on(SOCKET_EVENTS.TYPING_START, async (payload = {}) => {
    try {
      const conversationId = payload.conversationId;

      validateObjectId(conversationId, "conversation ID");
      await findConversationForUser(conversationId, userId);

      socket.to(conversationRoom(conversationId)).emit(SOCKET_EVENTS.TYPING_START, {
        conversationId,
        userId,
        name: socket.user.name,
      });
    } catch {
      // Ignore invalid typing events rather than leaking details.
    }
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, async (payload = {}) => {
    try {
      const conversationId = payload.conversationId;

      validateObjectId(conversationId, "conversation ID");
      await findConversationForUser(conversationId, userId);

      socket.to(conversationRoom(conversationId)).emit(SOCKET_EVENTS.TYPING_STOP, {
        conversationId,
        userId,
      });
    } catch {
      // Ignore invalid typing events rather than leaking details.
    }
  });
};

module.exports = {
  registerSocketHandlers,
};
