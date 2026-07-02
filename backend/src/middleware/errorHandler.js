const env = require('../config/env');

const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const globalErrorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    stack: env.nodeEnv === 'production' ? null : err.stack,
    errors: err.errors || undefined
  });
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
