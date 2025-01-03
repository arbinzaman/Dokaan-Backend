import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json({ status: 401, message: "Unauthorized" });
  }
    const token = authHeader.split(" ")[1];


    // verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ status: 401, message: "Forbidden" });
      }
      req.user = user;
      next();
    });
};


export default authMiddleware;