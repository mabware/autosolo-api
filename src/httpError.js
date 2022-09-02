class HttpError extends Error {
  constructor(code = 500, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }

    this.name = 'HttpError';
    // Custom debugging information
    this.code = code;
    this.date = new Date();
  }
}

module.exports = HttpError;
