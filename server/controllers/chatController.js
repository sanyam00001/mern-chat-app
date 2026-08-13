const asyncHandler = require("express-async-handler");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const {
  validateObjectId,
  validateCreateConversationInput,
  validateSendMessageInput,
  parsePaginationParams,
  validateUserSearchQuery,
} = require("../utils/validateChat");

const formatUserPreview = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
});

const formatConversationResponse = (conversation, currentUserId) => {
  const otherParticipant = conversation.participants.find(
    (participant) => participant._id.toString() !== currentUserId.toString()
  );

  return {
    _id: conversation._id,
    otherParticipant: otherParticipant
      ? formatUserPreview(otherParticipant)
      : null,
    lastMessage: conversation.lastMessage?.content
      ? {
          content: conversation.lastMessage.content,
          sender: conversation.lastMessage.sender,
          createdAt: conversation.lastMessage.createdAt,
        }
      : null,
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
  };
};

const formatMessageResponse = (message) => ({
  _id: message._id,
  conversation: message.conversation,
  sender: formatUserPreview(message.sender),
  content: message.content,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

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

  validateSendMessageInput({ content });

  await findConversationForUser(conversationId, currentUserId);

  const trimmedContent = content.trim();

  const message = await Message.create({
    conversation: conversationId,
    sender: currentUserId,
    content: trimmedContent,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: {
      content: trimmedContent,
      sender: currentUserId,
      createdAt: message.createdAt,
    },
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "name email avatar"
  );

  res.status(201).json(formatMessageResponse(populatedMessage));
});

module.exports = {
  searchUsers,
  createOrFindConversation,
  getConversations,
  getMessages,
  sendMessage,
};
