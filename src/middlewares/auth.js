import * as authService from '../services/auth.js';
import * as userService from '../services/user.js';

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Token JWT requis' });
  }
  const payload = authService.verifyToken(token);
  if (!payload?.email) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
  const user = await userService.findByUsernameOrEmail(payload.email);
  if (!user) {
    return res.status(401).json({ error: 'Utilisateur introuvable' });
  }
  req.user = user;
  next();
}

export {
  requireAuth,
};
