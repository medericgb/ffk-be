import * as userService from '../services/user.js';

function generate(req, res) {
  const count = req.query.count;
  const users = userService.generateUsers(count);
  const filename = `users-${users.length}-${Date.now()}.json`;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(JSON.stringify(users, null, 2));
}

async function batch(req, res) {
  if (!req.file?.buffer) {
    return res.status(400).json({
      error: 'Fichier requis',
      detail:
        'Envoyez un fichier JSON via le champ "file" (multipart/form-data).',
    });
  }
  try {
    const summary = await userService.importBatch(req.file.buffer);
    return res.status(200).json(summary);
  } catch (err) {
    if (err.message?.includes('JSON') || err.message?.includes('tableau')) {
      return res.status(400).json({ error: err.message });
    }
    return res
      .status(500)
      .json({ error: "Erreur lors de l'import", detail: err.message });
  }
}

function me(req, res) {
  return res.status(200).json(userService.sanitizeUser(req.user));
}

async function getByUsername(req, res) {
  const { username } = req.params;
  const target = await userService.findByUsername(username);
  if (!target) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  const current = req.user;
  const isAdmin = current.role === 'admin';
  const isSelf = current.username === target.username;
  if (!isAdmin && !isSelf) {
    return res.status(403).json({ error: 'Accès non autorisé à ce profil' });
  }
  return res.status(200).json(userService.sanitizeUser(target));
}

export { generate, batch, me, getByUsername };
