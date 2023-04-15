const jwt = require("jsonwebtoken");
const { AuthenticationError } = require("apollo-server-express");

module.exports = (context, req, res, next) => {
  const authHeader = context.req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error(
      "Authentication failed.Authorization header must be provided"
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(payload)
    return payload;

  } catch (err) {
    throw new AuthenticationError("invalid or expired token");
  }
};
