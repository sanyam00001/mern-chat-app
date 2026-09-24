const mongoose = require("mongoose");

const MIN_MESSAGE_LENGTH = 1;
const MAX_MESSAGE_LENGTH = 5000;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const MIN_SEARCH_LENGTH = 2;

const throwValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

const validateObjectId = (id, fieldName = "ID") => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throwValidationError(`Invalid ${fieldName}`);
  }
};

const validateCreateConversationInput = ({ recipientId }) => {
  if (!recipientId) {
    throwValidationError("Recipient user ID is required");
  }

  validateObjectId(recipientId, "recipient user ID");
};

const validateSendMessageInput = ({ content }) => {
  if (!content || !content.trim()) {
    throwValidationError("Message content is required");
  }

  const trimmed = content.trim();

  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    throwValidationError("Message content is required");
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throwValidationError(
      `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`
    );
  }
};

const validateOptionalCaption = (content) => {
  if (content == null || content === "") {
    return;
  }

  if (typeof content !== "string") {
    throwValidationError("Message content is invalid");
  }

  if (content.trim().length > MAX_MESSAGE_LENGTH) {
    throwValidationError(
      `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`
    );
  }
};

const parsePaginationParams = (query) => {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) {
    page = DEFAULT_PAGE;
  }

  if (Number.isNaN(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  return { page, limit };
};

const validateUserSearchQuery = (search) => {
  if (!search || !search.trim()) {
    throwValidationError("Search query is required");
  }

  const trimmed = search.trim();

  if (trimmed.length < MIN_SEARCH_LENGTH) {
    throwValidationError(
      `Search query must be at least ${MIN_SEARCH_LENGTH} characters`
    );
  }

  return trimmed;
};

module.exports = {
  validateObjectId,
  validateCreateConversationInput,
  validateSendMessageInput,
  validateOptionalCaption,
  parsePaginationParams,
  validateUserSearchQuery,
};
