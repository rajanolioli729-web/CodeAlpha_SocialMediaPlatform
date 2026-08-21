const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return errors.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(422).json({
      success: false,
      message: messages[0],
      data: { errors: messages }
    });
  }
  next();
}

module.exports = { validate };