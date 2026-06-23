# MenuFlow

**Plateforme SaaS de menus digitaux pour restaurants, cafés, snacks, hôtels et food courts au Maroc.**

MenuFlow permet aux restaurants de créer un menu digital accessible via QR Code, gérer les commandes en temps réel, les réservations, les clients, les statistiques, les paiements et l'abonnement.

## Stack Technique

| Couche | Technologies |
|--------|-------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, Recharts |
| Backend | Node.js, Express.js, PostgreSQL, Prisma ORM, Redis, Socket.io |
| Auth | JWT + Refresh Tokens, RBAC multi-tenant (Super Admin, Restaurant Owner, Manager, Employee) |
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

## Modèle Commercial

**Plateforme fermée (invitation uniquement)** — les restaurants ne peuvent pas s'inscrire eux-mêmes.

- Seul le **Super Admin** crée, active, suspend ou supprime les comptes restaurant
- Onboarding personnalisé par le propriétaire de la plateforme
- Isolation stricte des données par `restaurantId` (multi-tenant)

## Rôles

| Rôle | Accès |
|------|-------|
| `SUPER_ADMIN` | Panel admin complet, tous les restaurants |
| `RESTAURANT_OWNER` | Dashboard de son restaurant uniquement |
| `MANAGER` | Opérations restaurant (menu, commandes, réservations) |
| `EMPLOYEE` | Commandes et cuisine uniquement |

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
| Super Admin | admin@menuflow.ma | Admin123! | http://localhost:3000/admin |
| Propriétaire | owner@leriad-casa.ma | Owner123! | http://localhost:3000/dashboard |
| Manager | manager@leriad-casa.ma | Owner123! | http://localhost:3000/dashboard |

### Menu Démo

http://localhost:3000/menu/le-riad-casablanca

## Fonctionnalités

### Super Admin Panel (`/admin`)

- Dashboard global (restaurants, revenus, croissance)
- Gestion restaurants (créer, suspendre, activer, supprimer)
- Gestion utilisateurs (reset password, impersonation)
- Abonnements et expirations
- Monitoring (commandes, réservations)
- Audit logs et historique connexions
- Backups manuels/automatiques
- Paramètres plateforme

### Dashboard Restaurant (`/dashboard`)
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
- `POST /api/auth/login` - Connexion
- `GET /api/admin/dashboard` - Stats plateforme (Super Admin)
- `POST /api/admin/restaurants` - Créer restaurant + propriétaire
- `POST /api/admin/restaurants/:id/suspend` - Suspendre
- `POST /api/admin/restaurants/:id/impersonate` - Connexion en tant que propriétaire
- `GET /api/restaurants/slug/:slug` - Menu public
- `POST /api/restaurants/:id/orders` - Créer commande (client)

## Docker (Production)

```bash
docker compose up -d
```

## Sécurité

- JWT avec refresh tokens + historique connexions
- RBAC granulaire par rôle
- **Isolation multi-tenant** : middleware `enforceTenantAccess` sur toutes les routes restaurant
- Vérification restaurant actif (non suspendu)
- Rate limiting (200 req/15min)
- Helmet.js, validation Zod, audit logs complets
- Impersonation tracée dans les audit logs

## Licence

Propriétaire - MenuFlow © 2026
