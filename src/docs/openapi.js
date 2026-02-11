import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FFK API',
      version: '1.0.0',
      description: 'API d’authentification et de gestion des utilisateurs',
    },
    servers: [
      { url: 'http://localhost:9090', description: 'Serveur de développement' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token obtenu via POST /api/auth',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            detail: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user'] },
            birthDate: { type: 'string', format: 'date' },
            city: { type: 'string' },
            country: { type: 'string' },
            avatar: { type: 'string' },
            company: { type: 'string' },
            jobPosition: { type: 'string' },
            mobile: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BatchSummary: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            imported: { type: 'integer' },
            notImported: { type: 'integer' },
          },
        },
      },
    },
  },
  apis: ['./src/docs/openapi.js'],
};

/**
 * @openapi
 * /api/auth:
 *   post:
 *     summary: Connexion
 *     description: Authentification par username et mot de passe. Retourne un JWT à passer dans le header Authorization pour les routes protégées.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Champs manquants
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
void 0;

/**
 * @openapi
 * /api/users/generate:
 *   get:
 *     summary: Générer des utilisateurs (JSON)
 *     description: Génère un nombre donné d’utilisateurs fictifs et les retourne en JSON (téléchargement).
 *     tags:
 *       - Users
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre d’utilisateurs à générer (max 500)
 *     responses:
 *       200:
 *         description: Fichier JSON des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: 'object'
 */
void 0;

/**
 * @openapi
 * /api/users/batch:
 *   post:
 *     summary: Importer des utilisateurs en lot
 *     description: Envoie un fichier JSON (tableau d’utilisateurs) via multipart/form-data, champ "file".
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Résumé de l’import
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BatchSummary'
 *       400:
 *         description: Fichier manquant ou JSON invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
void 0;

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Utilisateur connecté
 *     description: Retourne le profil de l’utilisateur authentifié (sans le mot de passe).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
void 0;

/**
 * @openapi
 * /api/users/{username}:
 *   get:
 *     summary: Profil par username
 *     description: Retourne le profil d’un utilisateur. Autorisé pour l’admin ou pour son propre profil.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Accès non autorisé à ce profil
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Utilisateur introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
void 0;

export const openapiSpecification = swaggerJsdoc(options);
