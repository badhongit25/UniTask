const jwt = require('jsonwebtoken');
const { readDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'unitask_super_secret_jwt_key_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = readDb();
    const user = db.users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found or account deactivated.' });
    }

    // Attach user to request
    req.userId = user.id;
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      university: user.university || '',
      department: user.department || '',
      avatarUrl: user.avatarUrl || '',
      bio: user.bio || '',
      createdAt: user.createdAt
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = {
  authMiddleware,
  JWT_SECRET
};
