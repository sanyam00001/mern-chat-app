const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    attachment: {
      storageKey: {
        type: String,
      },
      originalName: {
        type: String,
      },
      mimeType: {
        type: String,
      },
      size: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.pre("validate", function validateMessagePayload() {
  const type = this.messageType || "text";

  if (type === "text" && !this.content?.trim()) {
    this.invalidate("content", "Message content is required");
  }

  if (
    (type === "image" || type === "file") &&
    !this.attachment?.storageKey
  ) {
    this.invalidate("attachment", "Attachment is required for media messages");
  }
});

messageSchema.index({ conversation: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;