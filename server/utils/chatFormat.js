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

module.exports = {
  formatUserPreview,
  formatConversationResponse,
  formatMessageResponse,
};
