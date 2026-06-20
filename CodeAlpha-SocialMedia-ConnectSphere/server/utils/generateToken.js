import jwt from "jsonwebtoken";

/**
 * Generates a signed JWT token for a given user ID.
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @returns {string} Signed JWT string valid for 7 days.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;
