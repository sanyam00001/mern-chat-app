const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const {
  validateObjectId,
  validateSendMessageInput,
  validateOptionalCaption,
} = require("../utils/validateChat");
const {
  formatMessageResponse,
  getMessagePreview,
} = require("../utils/chatFormat");
const {
  detectFileFromBuffer,
  sanitizeOriginalName,
  validateUploadSize,
} = require("../utils/fileValidation");
const { saveUploadBuffer, deleteStoredFile } = require("../utils/fileStorage");

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

const persistMessage = async ({ conversationId, userId, content, file }) => {
  await findConversationForUser(conversationId, userId);

  let trimmedContent = "";
  let messageType = "text";
  let attachment;
  let storageKey;

  if (file) {
    validateUploadSize(file.size);
    validateOptionalCaption(content);

    const detected = detectFileFromBuffer(file.buffer, file.originalname);
    const originalName = sanitizeOriginalName(file.originalname);

    storageKey = await saveUploadBuffer(
      file.buffer,
      conversationId,
      detected.extension
    );

    messageType = detected.messageType;
    trimmedContent = (content || "").trim();
    attachment = {
      storageKey,
      originalName,
      mimeType: detected.mimeType,
      size: file.size,
    };
  } else {
    validateSendMessageInput({ content });
    trimmedContent = content.trim();
  }

  try {
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      content: trimmedContent,
      messageType,
      ...(attachment ? { attachment } : {}),
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content: getMessagePreview(message),
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
  } catch (error) {
    if (storageKey) {
      await deleteStoredFile(storageKey);
    }

    throw error;
  }
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
