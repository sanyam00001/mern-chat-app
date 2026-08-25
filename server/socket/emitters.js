const { formatConversationResponse } = require("../utils/chatFormat");
const { getIO } = require("./ioInstance");
const { SOCKET_EVENTS, userRoom, conversationRoom } = require("./events");
const { getSocketIds, isOnline } = require("./presence");

const joinUserToConversation = (userId, conversationId) => {
  const io = getIO();

  if (!io) {
    return;
  }

  getSocketIds(userId).forEach((socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    socket?.join(conversationRoom(conversationId));
  });
};

const emitParticipantPresence = (io, conversation) => {
  conversation.participants.forEach((participant) => {
    const participantId = participant._id.toString();

    conversation.participants.forEach((other) => {
      const otherId = other._id.toString();

      if (otherId === participantId) {
        return;
      }

      io.to(userRoom(participantId)).emit(SOCKET_EVENTS.PRESENCE_UPDATE, {
        userId: otherId,
        isOnline: isOnline(otherId),
      });
    });
  });
};

const emitNewMessage = (message, conversation) => {
  const io = getIO();

  if (!io || !conversation) {
    return;
  }

  conversation.participants.forEach((participant) => {
    const participantId = participant._id.toString();

    joinUserToConversation(participantId, conversation._id.toString());

    io.to(userRoom(participantId)).emit(SOCKET_EVENTS.MESSAGE_NEW, message);
    io.to(userRoom(participantId)).emit(
      SOCKET_EVENTS.CONVERSATION_UPDATED,
      formatConversationResponse(conversation, participantId)
    );
  });
};

const emitConversationUpdated = (conversation) => {
  const io = getIO();

  if (!io || !conversation) {
    return;
  }

  conversation.participants.forEach((participant) => {
    const participantId = participant._id.toString();

    joinUserToConversation(participantId, conversation._id.toString());

    io.to(userRoom(participantId)).emit(
      SOCKET_EVENTS.CONVERSATION_UPDATED,
      formatConversationResponse(conversation, participantId)
    );
  });

  emitParticipantPresence(io, conversation);
};

const emitPresenceUpdate = (userIds, payload) => {
  const io = getIO();

  if (!io) {
    return;
  }

  userIds.forEach((userId) => {
    io.to(userRoom(userId)).emit(SOCKET_EVENTS.PRESENCE_UPDATE, payload);
  });
};

module.exports = {
  joinUserToConversation,
  emitNewMessage,
  emitConversationUpdated,
  emitPresenceUpdate,
};
