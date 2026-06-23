# MenuFlow

**Plateforme SaaS de menus digitaux pour restaurants, cafés, snacks, hôtels et food courts au Maroc.**

MenuFlow permet aux restaurants de créer un menu digital accessible via QR Code, gérer les commandes en temps réel, les réservations, les clients, les statistiques, les paiements et l'abonnement.

## Stack Technique

| Couche | Technologies |
|--------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Recharts |
| Backend | Node.js, Express.js, PostgreSQL, Prisma ORM, Redis, Socket.io |
| Auth | JWT + Refresh Tokens, RBAC (Super Admin, Owner, Manager, Employee) |
| Paiements | Stripe (+ PayPal, CMI, Payzone prévus) |
| Infra | Docker, AWS S3, Cloudflare CDN, GitHub Actions CI/CD |

## Structure du Projet

```
menuflow/
├── apps/
│   ├── api/          # Backend Express.js + Prisma + Socket.io
│   └── web/          # Frontend Next.js 15
├── packages/
│   └── shared/       # Types et constantes partagés
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Démarrage Rapide

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (via Docker)

### Installation

```bash
cd menuflow

# Copier les variables d'environnement
cp .env.example .env

# Démarrer PostgreSQL et Redis
docker compose up postgres redis -d

# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Peupler la base de données
npm run db:seed

# Lancer en développement
npm run dev
```

L'application sera disponible sur :
- **Frontend** : http://localhost:3000
- **API** : http://localhost:4000
- **API Docs (Swagger)** : http://localhost:4000/api/docs

### Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | admin@menuflow.ma | Admin123! |
| Propriétaire | owner@leriad-casa.ma | Owner123! |
| Manager | manager@leriad-casa.ma | Owner123! |

### Menu Démo

http://localhost:3000/menu/le-riad-casablanca

## Fonctionnalités

### Dashboard Admin
- Dashboard avec statistiques temps réel
- Gestion du menu (catégories, produits, promotions)
- Commandes en temps réel avec Socket.io
- Vue cuisine dédiée
- Gestion des réservations
- CRM clients avec points de fidélité
- Centre QR Code (restaurant + tables)
- Analytics avancés (revenus, heures de pointe, rétention)
- Gestion des employés et rôles
- Système d'abonnement (Free, Starter, Premium, Enterprise)
- Paramètres restaurant

### Application Client (Mobile Web)
- Menu digital multilingue (FR, AR, EN)
- Recherche et filtres
- Panier et commande
- Suivi de commande temps réel
- Avis et notes

### Fonctionnalités IA
- Générateur de descriptions de menu
- Analyse des ventes
- Recommandations de promotions
- Prédiction comportement client
- Chatbot client

### Super Admin
- Gestion de tous les restaurants
- Statistiques plateforme
- Gestion des abonnements

## API REST

Documentation Swagger complète disponible sur `/api/docs`.

Endpoints principaux :
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/restaurants/slug/:slug` - Menu public
- `POST /api/restaurants/:id/orders` - Créer commande
- `GET /api/restaurants/:id/analytics/dashboard` - Statistiques
- `POST /api/subscriptions/checkout` - Abonnement Stripe

## Docker (Production)

```bash
docker compose up -d
```

## Sécurité

- JWT avec refresh tokens
- Rate limiting (200 req/15min)
- Helmet.js (XSS, CSRF protection)
- Validation Zod sur toutes les entrées
- Prisma ORM (protection SQL injection)
- Audit logs
- RBAC granulaire

## Licence

Propriétaire - MenuFlow © 2026
