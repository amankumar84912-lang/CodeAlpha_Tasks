/**
 * 404 handler — mounted after all routes.
 * Converts unknown routes into a structured error passed to errorHandler.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

/**
 * Global error handler — must be the LAST middleware registered in server.js.
 * Reads err.statusCode (set by services/middleware) to determine HTTP status.
 * Never exposes stack traces in production.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[${new Date().toISOString()}] Error ${statusCode}: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
};
