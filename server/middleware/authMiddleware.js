const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  let token = req.header("Authorization") || req.header("authorization");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  // Support "Bearer <token>" as well as raw token
  if (token.startsWith("Bearer ")) token = token.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    req.userDecoded = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
