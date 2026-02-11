import * as authService from '../services/auth.js';

async function login(req, res) {
  const { username, password } = req.body ?? {};
  if (!username || password === undefined) {
    return res.status(400).json({
      error: 'Champs requis : username, password',
    });
  }
  try {
    const result = await authService.login(username, password);
    if (!result) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', detail: err.message });
  }
}

export {
  login,
};
