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

const getMessagePreview = (message) => {
  const content = (message.content || "").trim();

  if (content) {
    return content;
  }

  const type = message.messageType || "text";

  if (type === "image") {
    return "Photo";
  }

  if (type === "file") {
    return message.attachment?.originalName || "File";
  }

  return content;
};

const formatMessageResponse = (message) => {
  const messageType = message.messageType || "text";
  const hasAttachment = Boolean(message.attachment?.storageKey);

  return {
    _id: message._id,
    conversation: message.conversation,
    sender: formatUserPreview(message.sender),
    content: message.content || "",
    messageType,
    attachment: hasAttachment
      ? {
          url: `/chat/messages/${message._id}/attachment`,
          originalName: message.attachment.originalName,
          mimeType: message.attachment.mimeType,
          size: message.attachment.size,
        }
      : null,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

module.exports = {
  formatUserPreview,
  formatConversationResponse,
  formatMessageResponse,
  getMessagePreview,
};
