const express = require("express");
const {
  searchUsers,
  createOrFindConversation,
  getConversations,
  getMessages,
  sendMessage,
  getMessageAttachment,
  markConversationAsRead,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { optionalMessageUpload } = require("../middleware/uploadMiddleware");
const { messageLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.use(protect);

router.get("/users", searchUsers);
router.post("/conversations", createOrFindConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getMessages);
router.post(
  "/conversations/:conversationId/messages",
  messageLimiter,
  optionalMessageUpload,
  sendMessage
);
router.get("/messages/:messageId/attachment", getMessageAttachment);
router.patch("/conversations/:conversationId/read", markConversationAsRead);

module.exports = router;
