const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const {
  validateObjectId,
  validateSendMessageInput,
} = require("../utils/validateChat");
const { formatMessageResponse } = require("../utils/chatFormat");

const findConversationForUser = async (conversationId, userId) => {
  validateObjectId(conversationId, "conversation ID");

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const isParticipant = conversation.participants.some(
    (participantId) => participantId.toString() === userId.toString()
  );

  if (!isParticipant) {
    const error = new Error("Not authorized to access this conversation");
    error.statusCode = 403;
    throw error;
  }

  return conversation;
};

const persistMessage = async ({ conversationId, userId, content }) => {
  validateSendMessageInput({ content });

  await findConversationForUser(conversationId, userId);

  const trimmedContent = content.trim();

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    content: trimmedContent,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: {
      content: trimmedContent,
      sender: userId,
      createdAt: message.createdAt,
    },
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "name email avatar"
  );

  const populatedConversation = await Conversation.findById(
    conversationId
  ).populate("participants", "name email avatar");

  return {
    message: formatMessageResponse(populatedMessage),
    conversation: populatedConversation,
  };
};

const getUserConversationIds = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  }).select("_id participants");

  return conversations;
};

const getConversationPartnerIds = (conversations, userId) => {
  const partnerIds = new Set();

  conversations.forEach((conversation) => {
    conversation.participants.forEach((participantId) => {
      const id = participantId.toString();

      if (id !== userId.toString()) {
        partnerIds.add(id);
      }
    });
  });

  return [...partnerIds];
};

module.exports = {
  findConversationForUser,
  persistMessage,
  getUserConversationIds,
  getConversationPartnerIds,
};
