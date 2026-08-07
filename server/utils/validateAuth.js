const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

const validateRegisterInput = ({ name, email, password }) => {
  if (!name || !name.trim()) {
    const error = new Error("Name is required");
    error.statusCode = 400;
    throw error;
  }

  if (name.trim().length < MIN_NAME_LENGTH) {
    const error = new Error(`Name must be at least ${MIN_NAME_LENGTH} characters`);
    error.statusCode = 400;
    throw error;
  }

  if (!email || !email.trim()) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    const error = new Error("Please provide a valid email address");
    error.statusCode = 400;
    throw error;
  }

  if (!password) {
    const error = new Error("Password is required");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    const error = new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    );
    error.statusCode = 400;
    throw error;
  }
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !email.trim()) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    const error = new Error("Please provide a valid email address");
    error.statusCode = 400;
    throw error;
  }

  if (!password) {
    const error = new Error("Password is required");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
