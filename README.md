# FFK API

API REST d’authentification et de gestion des utilisateurs (Express, Prisma, PostgreSQL).

## Prérequis

- **Node.js** 18+ (LTS recommandé)
- **pnpm** 10+ (`npm install -g pnpm`)
- **PostgreSQL** 14+ (base de données)

## Installation

### 1. Cloner et entrer dans le projet

```bash
git clone <url-du-repo> ffk-be
cd ffk-be
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Variables d’environnement

Copier l’exemple et adapter les valeurs :

```bash
cp .env.example .env
```

Puis éditer `.env` :

```env
# Base de données (obligatoire pour migrations et runtime)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# JWT (optionnel en dev : une valeur par défaut est utilisée)
JWT_SECRET="votre-secret-jwt-en-production"
```

- **DATABASE_URL** : chaîne de connexion PostgreSQL (utilisée par Prisma et l’app).
- **JWT_SECRET** : secret pour signer les tokens. En dev, si absent, une valeur par défaut est utilisée ; en production, définir une valeur forte.

### 4. Base de données

Générer le client Prisma et appliquer les migrations :

```bash
pnpm db:generate
pnpm db:migrate
```

`db:migrate` crée les tables si nécessaire et met à jour le schéma. À la première exécution, avoir une base PostgreSQL déjà créée et `DATABASE_URL` correcte.

## Démarrage

### Serveur de développement

```bash
pnpm start
```

Le serveur tourne sur **http://localhost:9090** (nodemon : rechargement automatique à chaque modification).

### Vérification rapide

- **Page d’accueil** : http://localhost:9090  
- **Documentation API (Swagger UI)** : http://localhost:9090/api-docs  
- **Spec OpenAPI (JSON)** : http://localhost:9090/api-docs.json  

## Scripts disponibles

| Commande           | Description                                      |
|--------------------|--------------------------------------------------|
| `pnpm start`       | Démarre le serveur (nodemon)                    |
| `pnpm test`        | Lance les tests (Vitest) une fois               |
| `pnpm test:watch`  | Lance les tests en mode watch                   |
| `pnpm db:generate` | Génère le client Prisma                         |
| `pnpm db:migrate`  | Applique les migrations (mode dev)             |
| `pnpm db:studio`   | Ouvre Prisma Studio sur la base                 |

## Structure du projet

```
ffk-be/
├── prisma/
│   ├── schema.prisma      # Modèles et enum
│   └── migrations/        # Migrations SQL
├── prisma.config.ts       # Config Prisma (URL, chemin du schema)
├── src/
│   ├── index.js           # Point d’entrée Express
│   ├── docs/
│   │   └── openapi.js     # Spec OpenAPI (swagger-jsdoc) + JSDoc
│   ├── lib/
│   │   └── prisma.js      # Instance Prisma (client + adapter pg)
│   ├── routes/            # Routes Express (auth, user)
│   ├── controllers/       # Handlers HTTP (req/res)
│   ├── services/          # Logique métier (auth, user)
│   └── middlewares/       # Ex. requireAuth (JWT)
├── tests/
│   ├── services/          # Tests des services
│   └── controllers/       # Tests des controllers
├── vitest.config.js
├── package.json
└── README.md
```

## Documentation de l’API

L’API est documentée en **OpenAPI 3** via **swagger-jsdoc** :

- **Swagger UI** : http://localhost:9090/api-docs (essayer les routes, ajouter le JWT dans « Authorize »).
- **Spec JSON** : http://localhost:9090/api-docs.json (import Postman, génération de clients, etc.).

Endpoints principaux :

- **POST /api/auth** — Connexion (body : `username`, `password`) → `{ accessToken }`
- **GET /api/users/generate?count=** — Génération d’utilisateurs fictifs (JSON)
- **POST /api/users/batch** — Import en lot (multipart, champ `file`, JSON tableau)
- **GET /api/users/me** — Profil de l’utilisateur connecté (header `Authorization: Bearer <token>`)
- **GET /api/users/:username** — Profil par username (autorisé : soi-même ou admin)

## Tests

Les tests (Vitest) couvrent les **services** et les **controllers** (pas les middlewares). Prisma et les services externes sont mockés.

```bash
pnpm test
```

Mode watch pendant le dev :

```bash
pnpm test:watch
```

---

## Choix techniques

### Stack

- **Node.js + ESM** : `"type": "module"` dans `package.json` ; imports/exports natifs, pas de CommonJS.
- **Express 5** : serveur HTTP, routing, middlewares.
- **Prisma 7** : ORM, schéma déclaratif, migrations. Client généré avec `prisma-client-js`, connexion PostgreSQL via **@prisma/adapter-pg** (driver adapteur).
- **PostgreSQL** : base relationnelle ; l’URL est centralisée dans `prisma.config.ts` (Prisma) et dans l’app (client).

### Authentification

- **JWT** : token signé (HS256) avec `JWT_SECRET`, expiration 7 jours. Payload minimal : `{ email }`.
- **bcrypt** : hachage des mots de passe (côté service user) ; comparaison au login dans le service auth.
- Routes protégées : header `Authorization: Bearer <token>`. Le middleware `requireAuth` vérifie le token, charge l’utilisateur et attache `req.user`.

### Architecture

- **Routes** : définition des verbes et chemins, délégation aux controllers.
- **Controllers** : lecture req/res, validation minimale (présence des champs), appel des **services**, envoi des réponses (status + JSON).
- **Services** : logique métier (auth, user), accès BDD via Prisma, pas de dépendance à Express.
- **Middlewares** : réutilisables (ex. `requireAuth` pour toutes les routes protégées).

Cette séparation permet de tester les services et controllers avec des mocks (Prisma, autres services) sans démarrer le serveur.

### Données et import

- **Faker** : génération d’utilisateurs fictifs (GET /api/users/generate) pour exports JSON.
- **Import batch** : fichier JSON (tableau d’objets avec `email`, `username`, `password`, etc.) ; doublons email/username ignorés ; mots de passe hashés avant insertion.

### Documentation API

- **swagger-jsdoc** : spec OpenAPI 3 générée à partir de JSDoc (`@openapi`) dans `src/docs/openapi.js`. Un seul fichier pour la config et les paths évite de disperser la doc.
- **swagger-ui-express** : sert l’UI Swagger sur `/api-docs` et permet d’indiquer le Bearer JWT pour tester les routes protégées.

### Tests

- **Vitest** : runner de tests, compatible ESM, mocks intégrés (`vi.mock`).
- **Périmètre** : services (auth, user) et controllers (auth, user). Pas de tests d’intégration ni de middleware.
- **Mocks** : `@prisma/client` et `user.js` / `auth.js` mockés pour isoler la logique et éviter la BDD pendant les tests.

### Gestion de la config

- **dotenv** : chargé dans `prisma.config.ts` (migrations) et dans `src/lib/prisma.js` (app), pour lire `.env` (DATABASE_URL, JWT_SECRET).
- **prisma.config.ts** : config Prisma 7 (schema, migrations, datasource URL) pour `prisma migrate` et `prisma generate`.

### Package manager

- **pnpm** : install et lockfile (`pnpm-lock.yaml`) ; scripts et docs supposent `pnpm` pour cohérence.
