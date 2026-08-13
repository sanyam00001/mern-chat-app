const express = require("express");
const {
  searchUsers,
  createOrFindConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/users", searchUsers);
router.post("/conversations", createOrFindConversation);
router.get("/conversations", getConversations);
router.get("/conversations/:conversationId/messages", getMessages);
router.post("/conversations/:conversationId/messages", sendMessage);

module.exports = router;
