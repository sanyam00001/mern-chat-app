const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const {
  validateCreateConversationInput,
  parsePaginationParams,
  validateUserSearchQuery,
} = require("../utils/validateChat");
const {
  formatUserPreview,
  formatConversationResponse,
  formatMessageResponse,
} = require("../utils/chatFormat");
const {
  findConversationForUser,
  persistMessage,
} = require("../services/chatService");
const {
  emitNewMessage,
  emitConversationUpdated,
} = require("../socket/emitters");

const searchUsers = asyncHandler(async (req, res) => {
  const search = validateUserSearchQuery(req.query.search);
  const currentUserId = req.user._id;

  const users = await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  })
    .select("name email avatar")
    .limit(20)
    .sort({ name: 1 });

  res.status(200).json(users.map(formatUserPreview));
});

const createOrFindConversation = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;
  const currentUserId = req.user._id;

  validateCreateConversationInput({ recipientId });

  if (recipientId === currentUserId.toString()) {
    res.status(400);
    throw new Error("You cannot start a conversation with yourself");
  }

  const recipient = await User.findById(recipientId).select("name email avatar");

  if (!recipient) {
    res.status(404);
    throw new Error("Recipient user not found");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [currentUserId, recipientId], $size: 2 },
  }).populate("participants", "name email avatar");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [currentUserId, recipientId],
    });

    conversation = await Conversation.findById(conversation._id).populate(
      "participants",
      "name email avatar"
    );
  }

  emitConversationUpdated(conversation);

  res.status(200).json(formatConversationResponse(conversation, currentUserId));
});

const getConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const conversations = await Conversation.find({
    participants: currentUserId,
  })
    .populate("participants", "name email avatar")
    .sort({ updatedAt: -1 });

  res.status(200).json(
    conversations.map((conversation) =>
      formatConversationResponse(conversation, currentUserId)
    )
  );
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.user._id;
  const { page, limit } = parsePaginationParams(req.query);

  await findConversationForUser(conversationId, currentUserId);

  const total = await Message.countDocuments({ conversation: conversationId });
  const pages = Math.ceil(total / limit) || 1;

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "name email avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json({
    messages: messages.reverse().map(formatMessageResponse),
    page,
    pages,
    total,
    limit,
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const currentUserId = req.user._id;

  const { message, conversation } = await persistMessage({
    conversationId,
    userId: currentUserId,
    content,
  });

  emitNewMessage(message, conversation);

  res.status(201).json(message);
});

module.exports = {
  searchUsers,
  createOrFindConversation,
  getConversations,
  getMessages,
  sendMessage,
};
