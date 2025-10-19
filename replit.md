# Fanny & Compagnie - Système de Gestion de Supermarché

## Vue d'Ensemble

Application web complète de gestion pour le supermarché "Fanny & Compagnie" avec 5 modules interconnectés :
- **Gestion des Stocks** - Pour les gestionnaires de stocks
- **Point de Vente (Caisse)** - Pour les caissières
- **Portail Client** - Pour les clients avec programme de fidélité
- **Ressources Humaines** - Pour la gestion du personnel
- **Supervision** - Tableau de bord complet pour le superviseur

## Architecture Technique

### Frontend
- **Framework** : React avec Vite
- **Routing** : Wouter
- **UI** : Shadcn UI + Tailwind CSS
- **Gestion d'État** : TanStack Query (React Query)
- **Graphiques** : Recharts
- **QR Codes** : qrcode library

### Backend
- **Server** : Express.js
- **Base de données** : PostgreSQL (Neon)
- **ORM** : Drizzle ORM
- **Authentication** : Replit Auth (OpenID Connect)

## Structure de la Base de Données

### Tables Principales

#### Users (Replit Auth requis)
- id, email, firstName, lastName, profileImageUrl
- role: stock_manager | cashier | client | hr | supervisor

#### Products
- id, name, category, description, stockAlertThreshold

#### Suppliers
- id, name, contact, email, phone

#### Lots (Inventaire FEFO)
- id, matriculeId (barcode unique)
- productId, supplierId
- unitPrice, initialQuantity, remainingQuantity
- entryDate, expirationDate, status

#### Clients
- id, userId, qrCode (unique)
- loyaltyPoints, totalPurchases, eligibleDiscountsRemaining

#### Sales & SaleItems
- Enregistre les ventes avec FEFO logic
- Lie chaque vente aux lots utilisés

#### Employees, WorkSchedules, WorkHours, LeaveRequests
- Gestion complète du personnel

#### Alerts
- Alertes automatiques (stock bas, produits périmés)

#### FinancialRecords
- Enregistrements financiers (investissements, dépenses, salaires)

## Logique Métier Clé

### FEFO (First Expiring First Out)
Lors d'une vente, le système sélectionne automatiquement les lots qui expirent en premier pour minimiser les pertes.

### Système de Fidélité Automatique
- Client doit effectuer 10 achats de ≥5000 FCFA chacun
- Débloque automatiquement 5 réductions de 5%
- Réductions appliquées automatiquement lors du scan du QR code en caisse

### Génération Automatique
- **Code-barre lot** : `LOT-{timestamp}-{random}`
- **QR code client** : `CLIENT-{userId}-{uuid}`
- **Numéro reçu** : `REC-{YYYYMMDD}-{sequential}`

### Alertes Automatiques
- Stock bas : quand remainingQuantity < stockAlertThreshold
- Produits périmés : expirationDate < maintenant

## Rôles et Permissions

### stock_manager
- Gérer produits, lots, fournisseurs
- Voir alertes de stock
- Consulter entrées/sorties

### cashier
- Effectuer des ventes
- Scanner QR codes clients
- Générer reçus

### client
- Voir carte de fidélité avec QR code
- Consulter historique d'achats
- Suivre progression vers réductions

### hr
- Gérer employés et horaires
- Approuver/rejeter demandes de congé
- Consulter heures travaillées

### supervisor
- Vue complète sur tous les modules
- Statistiques et analyses financières
- KPIs et graphiques

## Routes API

### Authentification
- GET `/api/auth/user` - Récupère l'utilisateur connecté
- GET `/api/login` - Démarre le flux de connexion
- GET `/api/logout` - Déconnexion

### Products
- GET `/api/products` - Liste tous les produits
- POST `/api/products` - Créer un produit
- PATCH `/api/products/:id` - Modifier un produit

### Lots
- GET `/api/lots` - Liste tous les lots
- POST `/api/lots` - Créer un lot (génère matriculeId automatiquement)
- PATCH `/api/lots/:id` - Modifier un lot

### Suppliers
- GET `/api/suppliers` - Liste tous les fournisseurs
- POST `/api/suppliers` - Créer un fournisseur

### Sales
- GET `/api/sales` - Liste toutes les ventes
- POST `/api/sales` - Effectuer une vente (applique FEFO, calcule réductions)

### Clients
- GET `/api/clients/me` - Récupère le profil client de l'utilisateur
- GET `/api/clients/qr/:qrCode` - Recherche un client par QR code
- GET `/api/clients/purchases` - Historique d'achats du client
- POST `/api/clients` - Créer un profil client

### Employees
- GET `/api/employees` - Liste tous les employés
- POST `/api/employees` - Créer un employé
- GET `/api/work-hours` - Heures travaillées

### Leave Requests
- GET `/api/leave-requests` - Liste toutes les demandes
- POST `/api/leave-requests` - Créer une demande
- PATCH `/api/leave-requests/:id` - Approuver/rejeter

### Alerts
- GET `/api/alerts` - Liste toutes les alertes actives
- PATCH `/api/alerts/:id` - Résoudre une alerte

### Supervisor
- GET `/api/supervisor/stats` - Toutes les statistiques consolidées

## Design System

### Couleurs
- **Primary** : Vert marché (145 65% 45%) - Fanny & Compagnie
- **Stock Module** : Bleu cyan (200 80% 50%)
- **Cashier Module** : Violet (280 65% 60%)
- **Client Portal** : Vert brand (145 65% 45%)
- **HR Module** : Orange chaud (25 85% 55%)
- **Supervisor** : Rouge-rose (340 75% 55%)

### Typographie
- Font : Inter
- Headings : 600 weight
- Body : 400 weight
- Tailles : 32px (dashboard headers) → 12px (small print)

### Composants
- Cards avec élévation subtile
- Buttons avec hover-elevate et active-elevate-2
- Tables avec pagination et tri
- Dialogs pour ajout/modification
- Badges pour statuts
- Graphiques pour visualisations

## Modules Détaillés

### 1. Gestion des Stocks
- **Vue principale** : Tabs (Lots, Produits, Fournisseurs)
- **Alertes** : Cards colorées en haut (rouge = périmé, jaune = stock bas)
- **Stats** : Total produits, stock total, alertes actives
- **Actions** : Ajouter produit/lot/fournisseur via dialogs

### 2. Point de Vente (Caisse)
- **Layout** : 2 colonnes (produits | panier)
- **Produits** : Grid de cards cliquables avec prix et stock
- **Panier** : Liste avec +/- quantité
- **Client** : Scan QR code pour appliquer réductions
- **Paiement** : Boutons Espèces/Carte/Mobile Money
- **Reçu** : Dialog avec détails de la transaction

### 3. Portail Client
- **Carte de Fidélité** : Card avec gradient, points, réductions disponibles
- **QR Code** : Canvas généré dynamiquement
- **Progression** : Barre de progression vers réductions
- **Historique** : Liste des achats récents avec badges

### 4. Ressources Humaines
- **Tabs** : Employés, Demandes de congé, Heures travaillées
- **Stats** : Employés actifs, demandes en attente, heures du mois
- **Actions** : Approuver/rejeter demandes avec boutons Check/X
- **Ajout** : Dialog pour nouvel employé

### 5. Supervision
- **KPIs** : Grid de cards (stock, ventes, finances, personnel)
- **Graphiques** : Pie chart (ventes par catégorie), Bar chart (ventes récentes)
- **Finances** : Chiffre d'affaires, dépenses, revenu net

## Commandes

### Développement
```bash
npm run dev           # Démarre le serveur de développement
npm run db:push       # Synchronise le schéma avec la base de données
npm run db:studio     # Ouvre Drizzle Studio
```

### Production
Le projet utilise Replit Deployments. Cliquer sur "Deploy" dans Replit.

## Notes Importantes

1. **Sécurité** : Toutes les routes API (sauf `/api/login` et `/api/logout`) utilisent le middleware `isAuthenticated`
2. **FEFO** : Implémenté côté backend lors des ventes pour garantir la cohérence
3. **Réductions automatiques** : Calculées en temps réel lors du scan du QR client
4. **Alertes** : Générées par cron job ou lors des opérations de stock
5. **Devises** : Tous les montants en FCFA (Francs CFA)
6. **Localisation** : Interface en français avec dates localisées (date-fns/locale/fr)

## Prochaines Étapes Possibles

- Export PDF/Excel des rapports
- Système de notifications push
- Gestion des fournisseurs avancée avec commandes automatiques
- Application mobile pour clients
- Analyses prédictives et ML
