
# Guide de Test - Fanny & Compagnie

## Prérequis

Avant de commencer les tests, assurez-vous que :
- L'application est démarrée (`npm run dev`)
- La base de données est synchronisée (`npm run db:push`)
- Vous avez accès à l'URL de l'application

## 1. Tests d'Authentification

### 1.1 Connexion
1. Accédez à la page d'accueil
2. Cliquez sur "Se Connecter"
3. Authentifiez-vous avec Replit
4. Vérifiez que vous êtes redirigé vers votre interface selon votre rôle

### 1.2 Déconnexion
1. Cliquez sur votre profil dans la sidebar
2. Sélectionnez "Se déconnecter"
3. Vérifiez que vous êtes redirigé vers la page d'accueil

## 2. Module Gestion des Stocks (stock_manager)

### 2.1 Ajouter un Produit
1. Connectez-vous avec un compte `stock_manager`
2. Cliquez sur "Produit" dans la barre d'action
3. Remplissez le formulaire :
   - Nom : "Riz Parfumé"
   - Catégorie : "Alimentaire"
   - Description : "Riz de qualité supérieure"
   - Seuil d'alerte : 20
4. Cliquez sur "Ajouter"
5. **Attendu** : Le produit apparaît dans l'onglet "Produits"

### 2.2 Ajouter un Fournisseur
1. Cliquez sur "Fournisseur"
2. Remplissez le formulaire :
   - Nom : "Distributeur Global"
   - Contact : "Jean Dupont"
   - Email : "contact@distributeur.com"
   - Téléphone : "+225 07 00 00 00"
3. Cliquez sur "Ajouter"
4. **Attendu** : Le fournisseur apparaît dans l'onglet "Fournisseurs"

### 2.3 Ajouter un Lot
1. Cliquez sur "Lot"
2. Remplissez le formulaire :
   - Produit : Sélectionnez "Riz Parfumé"
   - Fournisseur : Sélectionnez "Distributeur Global"
   - Prix unitaire : 500
   - Quantité : 100
   - Date d'expiration : Choisissez une date future (ex: dans 6 mois)
3. Cliquez sur "Ajouter"
4. **Attendu** : 
   - Le lot apparaît dans l'onglet "Lots"
   - Un matricule unique est généré automatiquement
   - Le statut est "active"

### 2.4 Tester les Alertes de Stock Bas
1. Créez un produit avec seuil d'alerte : 10
2. Ajoutez un lot avec quantité : 5
3. **Attendu** : Une alerte "Stock bas" apparaît en haut de page avec fond jaune

### 2.5 Tester les Alertes de Produit Périmé
1. Créez un lot avec date d'expiration passée
2. **Attendu** : Une alerte "Produit périmé" apparaît avec fond rouge
3. Cliquez sur "Résoudre" pour marquer l'alerte comme résolue

### 2.6 Recherche et Filtrage
1. Allez dans l'onglet "Lots"
2. Utilisez la barre de recherche pour chercher par :
   - Matricule du lot
   - Nom du produit
   - Nom du fournisseur
3. **Attendu** : Les résultats sont filtrés en temps réel

## 3. Module Point de Vente (cashier)

### 3.1 Vente Simple sans Client
1. Connectez-vous avec un compte `cashier`
2. Dans la section "Produits Disponibles", recherchez un produit
3. Cliquez sur une card produit pour l'ajouter au panier
4. Vérifiez le panier :
   - Le produit apparaît avec quantité 1
   - Le prix unitaire est affiché
   - Le total est calculé
5. Modifiez la quantité avec les boutons +/-
6. Cliquez sur "Espèces" pour finaliser
7. **Attendu** :
   - Un reçu s'affiche dans un dialog
   - Le stock du lot est décrémenté
   - Le panier est vidé

### 3.2 Vente avec Client Fidèle
1. D'abord, créez un profil client :
   - Connectez-vous avec un nouveau compte (role: client)
   - Allez dans "Portail Client"
   - Notez le code QR affiché
2. Reconnectez-vous en tant que `cashier`
3. Ajoutez des produits au panier (total > 5000 FCFA)
4. Dans la section "Client", entrez le code QR du client
5. Cliquez sur "Identifier"
6. **Attendu** :
   - Les infos du client s'affichent
   - Ses points de fidélité sont visibles
   - Si éligible, la réduction de 5% est appliquée au total
7. Finalisez la vente
8. **Attendu** :
   - Le client gagne 1 point de fidélité
   - L'achat est enregistré dans son historique

### 3.3 Tester le Système de Fidélité (10 achats de 5000 FCFA)
1. Avec le même client, effectuez 10 achats de 5000 FCFA minimum
2. **Attendu après 10 achats** :
   - Le client a 5 réductions de 5% disponibles
   - Badge "X réduction(s) 5% disponible(s)" s'affiche
3. Effectuez un nouvel achat avec ce client
4. **Attendu** :
   - Réduction de 5% appliquée automatiquement
   - Le nombre de réductions diminue de 1

### 3.4 Vente avec Stock Insuffisant
1. Ajoutez un produit au panier
2. Augmentez la quantité au-delà du stock disponible
3. **Attendu** : Toast d'erreur "Stock insuffisant"

### 3.5 Méthodes de Paiement
Testez chaque méthode :
- **Espèces** : Bouton vert
- **Carte** : Bouton blanc avec bordure
- **Mobile Money** : Bouton blanc pleine largeur

Pour chaque méthode, vérifiez que la vente est enregistrée correctement.

### 3.6 Reçu de Vente
Après une vente, vérifiez le reçu :
- Numéro de reçu unique
- Date et heure
- Nom du client (si identifié)
- Liste des articles avec quantités
- Sous-total, réduction (si applicable), total
- Message de remerciement

## 4. Module Portail Client (client)

### 4.1 Consulter la Carte de Fidélité
1. Connectez-vous avec un compte `client`
2. Vérifiez l'affichage :
   - Nom du client
   - Email
   - Points de fidélité
   - Nombre d'achats totaux
   - Réductions disponibles (badge si > 0)

### 4.2 Code QR
1. Vérifiez que le canvas QR est généré
2. Notez le code affiché sous le QR
3. **Test manuel** : Utilisez ce code dans l'interface caisse

### 4.3 Progression vers Réduction
1. Vérifiez la barre de progression
2. Elle doit afficher : "X / 10 achats qualifiants"
3. Pourcentage correct
4. Message indiquant combien d'achats restants

### 4.4 Historique d'Achats
1. Effectuez plusieurs achats (via module caisse)
2. Retournez au portail client
3. **Attendu** :
   - Les achats apparaissent par ordre chronologique
   - Montant affiché en FCFA
   - Date et heure formatées en français
   - Badge "-5%" si réduction appliquée
   - Badge "Qualifiant" si montant ≥ 5000 FCFA

## 5. Module Ressources Humaines (hr)

### 5.1 Ajouter un Employé
1. Connectez-vous avec un compte `hr`
2. Cliquez sur "Ajouter Employé"
3. Remplissez :
   - ID Utilisateur : L'ID d'un utilisateur existant
   - Taux Horaire : 2000 FCFA/h
   - Date d'Embauche : Date actuelle
4. Cliquez sur "Ajouter"
5. **Attendu** : L'employé apparaît dans la liste avec statut "active"

### 5.2 Consulter les Heures Travaillées
1. Allez dans l'onglet "Heures Travaillées"
2. Vérifiez l'affichage :
   - Nom de l'employé
   - Date de travail
   - Nombre d'heures
   - Mois/Année

### 5.3 Gérer les Demandes de Congé
1. Créez d'abord une demande (via API ou base de données)
2. Allez dans l'onglet "Demandes de Congé"
3. Vérifiez les colonnes :
   - Employé, Type (Congé/Maladie), Dates, Raison, Statut
4. Pour une demande "pending" :
   - Cliquez sur l'icône ✓ (check) pour approuver
   - Cliquez sur l'icône ✗ (x) pour rejeter
5. **Attendu** : Le statut change et un badge coloré s'affiche

### 5.4 Statistiques RH
Vérifiez les cartes en haut :
- **Employés Actifs** : Compte des employés avec statut "active"
- **Demandes en Attente** : Nombre de demandes "pending"
- **Heures ce Mois** : Total des heures du mois actuel
- **Total Employés** : Tous les employés

## 6. Module Superviseur (supervisor)

### 6.1 Statistiques Inventaire
1. Connectez-vous avec un compte `supervisor`
2. Section "Inventaire & Stock" - Vérifiez :
   - **Total Produits** : Nombre total de produits
   - **Stock Total** : Somme de toutes les quantités restantes
   - **Stock Bas** : Nombre d'alertes de stock bas actives
   - **Produits Périmés** : Nombre d'alertes de produits périmés

### 6.2 Statistiques Ventes
Section "Ventes" :
- **Total Ventes** : Nombre de ventes enregistrées
- **Chiffre d'Affaires** : Somme des montants finaux
- **Vente Moyenne** : Chiffre d'affaires / nombre de ventes

### 6.3 Statistiques Personnel
Section "Personnel" :
- **Total Employés** : Tous les employés
- **Employés Actifs** : Statut "active"
- **Masse Salariale** : Estimation basée sur les heures travaillées

### 6.4 Vue Financière
Section "Finances" :
- **Chiffre d'Affaires** : Revenus des ventes
- **Investissements** : Somme des achats de lots (prix × quantité)
- **Dépenses** : Investissements + masse salariale
- **Revenu Net** : Chiffre d'affaires - dépenses

Vérifiez que :
- Les montants sont formatés en FCFA
- Le revenu net est en vert si positif, rouge si négatif

### 6.5 Graphiques
1. **Ventes par Catégorie** (Pie Chart) :
   - Vérifiez que toutes les catégories sont représentées
   - Pourcentages corrects
   - Couleurs distinctes

2. **Ventes Récentes** (Bar Chart) :
   - Affiche les 7 derniers jours
   - Nombre de ventes par jour
   - Axe X : dates, Axe Y : nombre

## 7. Tests de Navigation et Sécurité

### 7.1 Contrôle d'Accès par Rôle
Testez que chaque rôle ne peut accéder qu'à ses modules :

| Rôle | Modules Accessibles |
|------|---------------------|
| stock_manager | Gestion des Stocks |
| cashier | Point de Vente |
| client | Portail Client |
| hr | Ressources Humaines |
| supervisor | Tous les modules (via navigation) |

### 7.2 Test de Redirection
1. Essayez d'accéder à `/stock` sans être connecté
2. **Attendu** : Redirection vers `/api/login`

### 7.3 Sidebar Navigation
1. Vérifiez que la sidebar affiche uniquement les liens pertinents
2. Testez la navigation entre les modules
3. Le module actif doit être surligné

## 8. Tests de Performance et UX

### 8.1 Responsive Design
Testez l'application sur différentes tailles d'écran :
- **Desktop** : Layout normal avec sidebar
- **Tablet** : Grilles adaptatives (4 colonnes → 2 colonnes)
- **Mobile** : Sidebar compacte, grilles en 1 colonne

### 8.2 États de Chargement
1. Rafraîchissez une page
2. **Attendu** : Spinner de chargement avec message "Chargement..."

### 8.3 Gestion d'Erreurs
1. Essayez d'ajouter un lot avec des données invalides
2. **Attendu** : Toast d'erreur avec message explicatif

### 8.4 Recherche en Temps Réel
1. Dans n'importe quel module avec recherche
2. Tapez dans le champ de recherche
3. **Attendu** : Filtrage instantané sans délai

## 9. Scénario de Test Complet

### Cas d'usage : Journée Type au Supermarché

**Matin - Réception de stock (stock_manager)**
1. Connexion en tant que gestionnaire de stock
2. Ajout de 3 nouveaux produits
3. Ajout d'un fournisseur
4. Création de 5 lots avec différentes dates d'expiration
5. Vérification des alertes

**Journée - Ventes (cashier)**
1. Connexion en tant que caissière
2. Effectuer 15 ventes :
   - 5 sans client identifié
   - 10 avec des clients fidèles différents
   - Mélanger les méthodes de paiement
3. Tester les réductions pour les clients éligibles

**Après-midi - Gestion RH (hr)**
1. Connexion en tant que RH
2. Ajouter 2 nouveaux employés
3. Approuver 3 demandes de congé
4. Rejeter 1 demande
5. Consulter les heures du mois

**Soir - Consultation Client (client)**
1. Connexion avec différents comptes clients
2. Vérifier les points de fidélité
3. Consulter l'historique d'achats
4. Vérifier la progression vers réductions

**Fin de journée - Rapport Superviseur (supervisor)**
1. Connexion en tant que superviseur
2. Consulter toutes les statistiques
3. Analyser les graphiques
4. Vérifier le revenu net du jour

## 10. Checklist Finale

- [ ] Authentification fonctionne pour tous les rôles
- [ ] Produits, lots et fournisseurs s'ajoutent correctement
- [ ] Alertes de stock bas et périmé s'affichent
- [ ] Ventes sans client fonctionnent
- [ ] Ventes avec client et réductions fonctionnent
- [ ] Système de fidélité (10 achats → 5 réductions) opérationnel
- [ ] QR Code généré pour chaque client
- [ ] Historique d'achats client visible
- [ ] Employés ajoutés et visibles
- [ ] Demandes de congé approuvables/rejetables
- [ ] Statistiques superviseur correctes
- [ ] Graphiques affichés avec données réelles
- [ ] Navigation sidebar fonctionnelle
- [ ] Recherche et filtrage performants
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Toasts de succès/erreur appropriés
- [ ] Reçus de vente affichés correctement

## 11. Bugs Connus à Vérifier

Lors des tests, vérifiez particulièrement :
1. **FEFO** : Les lots les plus anciens (date d'expiration) sont vendus en premier
2. **Décrémentation stock** : Le stock diminue après chaque vente
3. **Points fidélité** : Incrémentés après chaque achat ≥ 5000 FCFA
4. **Génération matricule** : Unique pour chaque lot
5. **Format dates** : En français avec date-fns
6. **Montants FCFA** : Sans décimales (toFixed(0))

## 12. Données de Test Recommandées

Pour faciliter les tests, créez :
- **5 produits** de catégories différentes
- **3 fournisseurs** avec contacts complets
- **10 lots** avec dates d'expiration variées
- **5 comptes clients** pour tester la fidélité
- **3 employés** avec taux horaires différents
- **Effectuer 20 ventes** pour avoir des statistiques

## Notes

- Tous les montants sont en **FCFA** (Francs CFA)
- Les dates sont formatées en **français**
- Le système utilise **FEFO** (First Expired, First Out) pour la gestion des stocks
- Les réductions de **5%** sont appliquées automatiquement après **10 achats qualifiants**
- Un achat est qualifiant si son montant est **≥ 5000 FCFA**
