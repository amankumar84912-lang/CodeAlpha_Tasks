/**
 * Sends a standardised success response.
 * Shape: { success: true, data: <payload> }
 *
 * @param {import('express').Response} res
 * @param {*} data  - The payload to include in data field
 * @param {number} statusCode - HTTP status code (default 200)
 */
export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};
