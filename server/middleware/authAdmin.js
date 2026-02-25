const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Fix "Bearer <token>" format
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: remove isAdmin check (your token doesn't have isAdmin)
    req.admin = decoded;

    next();
  } catch (error) {
    console.log("AUTH ERROR:", error);
    return res.status(400).json({ message: "Invalid token" });
  }
};
