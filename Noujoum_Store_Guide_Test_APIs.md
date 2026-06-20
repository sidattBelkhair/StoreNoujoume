# NOUJOUM STORE — Guide de test complet des APIs

**57 endpoints documentés avec commandes curl**
**Base URL :** `https://noujoumstore.com/api`
Stack : Laravel / Sanctum

---

## 0. SETUP — Avant de commencer

Toutes les commandes s'exécutent dans le terminal (zsh, Arch Linux). Copie-colle chaque commande telle quelle.

### Légende des niveaux d'authentification

| Niveau | Description |
|--------|-------------|
| 🟢 Public | Aucun token requis — accessible sans connexion |
| 🟡 User | Token utilisateur requis — se connecter d'abord |
| 🔴 Admin | Token admin requis — compte administrateur |

### Variables à définir dans le terminal

```bash
# Colle ces lignes dans ton terminal au début de chaque session de test
BASE="https://noujoumstore.com/api"

# Token user — sera rempli après le login (Section 1)
TOKEN=""

# Token admin — sera rempli après le login admin
ADMIN_TOKEN=""
```

---

## 1. RÉSUMÉ DE TOUTES LES APIs

### Routes Publiques — Aucun token requis

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/test` | Ping serveur | Public |
| GET | `/stats` | Stats globales | Public |
| GET | `/categories` | Liste catégories | Public |
| GET | `/categories/{id}` | Détail catégorie | Public |
| GET | `/apps` | Liste apps | Public |
| GET | `/apps/{id}` | Détail app | Public |
| GET | `/apps/featured/list` | Apps featured | Public |
| GET | `/apps/most-downloaded/list` | Plus téléchargées | Public |
| GET | `/apps/top-rated/list` | Mieux notées | Public |
| GET | `/subscription/packages` | Packages dispo | Public |
| GET | `/subscription/payment-info` | Info paiement | Public |
| GET | `/subscription/settings` | Settings abo | Public |
| POST | `/register` | Inscription | Public |
| POST | `/login` | Connexion | Public |
| POST | `/verify-email` | Vérifier email | Public |
| POST | `/resend-verification` | Renvoyer code | Public |

### Routes Authentifiées — Token user requis

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/profile` | Mon profil | User |
| PUT | `/profile` | Modifier profil | User |
| POST | `/logout` | Déconnexion | User |
| GET | `/my-apps` | Mes apps | User |
| POST | `/apps` | Publier une app | User |
| PUT | `/apps/{id}` | Modifier mon app | User |
| DELETE | `/apps/{id}` | Supprimer mon app | User |
| GET | `/subscription/status` | Mon abonnement | User |
| GET | `/subscription/transactions` | Mes transactions | User |
| GET | `/subscription/transactions/{id}` | Détail transaction | User |
| POST | `/subscription/payment` | Créer paiement | User |
| POST | `/subscription/transactions/{id}/cancel` | Annuler transaction | User |
| POST | `/upload` | Uploader fichier | User |
| POST | `/upload-multiple` | Upload multiple | User |
| DELETE | `/upload` | Supprimer fichier | User |

### Routes Admin — Token admin requis

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/admin/stats` | Stats dashboard | Admin |
| GET | `/admin/users` | Tous les users | Admin |
| DELETE | `/admin/users/{id}` | Supprimer user | Admin |
| POST | `/admin/users/{id}/toggle-verify` | Vérifier user | Admin |
| GET | `/admin/apps` | Toutes les apps | Admin |
| POST | `/admin/apps/{id}/approve` | Approuver app | Admin |
| POST | `/admin/apps/{id}/reject` | Rejeter app | Admin |
| POST | `/admin/apps/{id}/toggle-feature` | Featured app | Admin |
| POST | `/admin/categories` | Créer catégorie | Admin |
| PUT | `/admin/categories/{id}` | Modifier catégorie | Admin |
| DELETE | `/admin/categories/{id}` | Supprimer catégorie | Admin |
| GET | `/admin/settings` | Tous les settings | Admin |
| GET | `/admin/settings/public` | Settings publics | Admin |
| GET | `/admin/settings/group/{group}` | Settings par groupe | Admin |
| POST | `/admin/settings` | Créer setting | Admin |
| PUT | `/admin/settings/{id}` | Modifier setting | Admin |
| DELETE | `/admin/settings/{id}` | Supprimer setting | Admin |
| POST | `/admin/settings/bulk-update` | Update groupé | Admin |
| GET | `/admin/subscription/packages` | Packages admin | Admin |
| POST | `/admin/subscription/packages` | Créer package | Admin |
| PUT | `/admin/subscription/packages/{id}` | Modifier package | Admin |
| DELETE | `/admin/subscription/packages/{id}` | Supprimer package | Admin |
| GET | `/admin/subscription/stats` | Stats abonnements | Admin |
| GET | `/admin/subscription/transactions` | Toutes transactions | Admin |
| POST | `/admin/subscription/transactions/{id}/approve` | Approuver transaction | Admin |
| POST | `/admin/subscription/transactions/{id}/reject` | Rejeter transaction | Admin |

---

## 2. TESTS DÉTAILLÉS — Copie chaque commande curl

### 2.1 Connectivité — Tester que le serveur répond

**`GET /test`** · Auth: **Public**
Vérifie que le serveur Laravel est en ligne et répond.

```bash
curl -s "https://noujoumstore.com/api/test" | python3 -m json.tool
```

Réponse :
```json
{ "message": "ok" }
```

> Si tu obtiens une erreur de connexion, vérifie l'URL du serveur.

---

### 2.2 Authentification

#### Étape 1 — Créer un compte de test

> **Important :** utilise un email yopmail pour ne pas polluer les vrais utilisateurs.

**`POST /register`** · Auth: **Public**
Créer un nouveau compte utilisateur.

```bash
curl -s -X POST "https://noujoumstore.com/api/register" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test Web Platform",
    "email": "test.web@yopmail.com",
    "password": "TestPass123!",
    "password_confirmation": "TestPass123!"
  }' | python3 -m json.tool
```

Réponse :
```json
{
  "message": "User registered successfully",
  "user": { "id": 5, "name": "Test Web Platform", "email": "test.web@yopmail.com" }
}
```

> Vérifie l'email de vérification sur yopmail.com avec l'adresse `test.web@yopmail.com`.

#### Étape 2 — Vérifier l'email si requis

**`POST /verify-email`** · Auth: **Public**
Vérifier l'adresse email avec le code reçu.

```bash
curl -s -X POST "https://noujoumstore.com/api/verify-email" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test.web@yopmail.com",
    "code": "XXXXXX"
  }' | python3 -m json.tool
```

Réponse :
```json
{ "message": "Email verified successfully" }
```

> Remplace `XXXXXX` par le code reçu par email sur yopmail.com.

#### Étape 3 — Se connecter et récupérer le token (OBLIGATOIRE)

Cette commande récupère automatiquement le token et le stocke dans la variable `$TOKEN`.

**`POST /login`** · Auth: **Public**
Connexion — récupère le token Bearer pour les requêtes authentifiées.

```bash
# Connexion + récupération automatique du token
LOGIN=$(curl -s -X POST "https://noujoumstore.com/api/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test.web@yopmail.com","password":"TestPass123!"}')
echo $LOGIN | python3 -m json.tool

# Extraire et stocker le token automatiquement
TOKEN=$(echo $LOGIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token') or d.get('access_token',''))")
echo "TOKEN = $TOKEN"
```

Réponse :
```json
{
  "token": "1|abc123xyz...",
  "user": {
    "id": 5,
    "name": "Test Web Platform",
    "email": "test.web@yopmail.com"
  }
}
```

> Après cette commande, `$TOKEN` est défini. Toutes les sections suivantes l'utilisent automatiquement.

---

### 2.3 Routes Publiques — Aucun token requis

**`GET /stats`** · Auth: **Public**
Statistiques globales de la plateforme (nombre d'apps, users, téléchargements...).

```bash
curl -s "https://noujoumstore.com/api/stats" | python3 -m json.tool
```

Réponse :
```json
{
  "total_apps": 45,
  "total_users": 120,
  "total_downloads": 8500,
  "total_categories": 8
}
```

---

**`GET /categories`** · Auth: **Public**
Liste complète de toutes les catégories d'applications disponibles.

```bash
curl -s "https://noujoumstore.com/api/categories" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 1, "name": "Éducation", "icon": "book", "apps_count": 12 },
    { "id": 2, "name": "Business", "icon": "briefcase", "apps_count": 8 }
  ]
}
```

> Note les IDs des catégories — tu en auras besoin pour filtrer les apps.

---

**`GET /categories/{id}`** · Auth: **Public**
Détail d'une catégorie spécifique avec ses applications associées.

```bash
# Remplace 1 par l'ID de la catégorie qui t'intéresse
curl -s "https://noujoumstore.com/api/categories/1" | python3 -m json.tool
```

Réponse :
```json
{
  "id": 1,
  "name": "Éducation",
  "description": "Applications éducatives",
  "apps_count": 12
}
```

---

**`GET /apps`** · Auth: **Public**
Liste paginée de toutes les applications. Supporte des paramètres de filtrage.

```bash
# Liste simple
curl -s "https://noujoumstore.com/api/apps" | python3 -m json.tool

# Avec filtres (teste chaque variante séparément)
curl -s "https://noujoumstore.com/api/apps?page=1&per_page=10" | python3 -m json.tool
curl -s "https://noujoumstore.com/api/apps?category_id=1" | python3 -m json.tool
curl -s "https://noujoumstore.com/api/apps?search=calculatrice" | python3 -m json.tool
curl -s "https://noujoumstore.com/api/apps?sort=downloads" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    {
      "id": 1,
      "name": "Mon App",
      "description": "...",
      "category": { "id": 1, "name": "Éducation" },
      "downloads": 1200,
      "rating": 4.5
    }
  ],
  "meta": { "current_page": 1, "total": 45, "per_page": 15 }
}
```

> Teste tous les filtres un par un pour savoir lesquels sont disponibles.

---

**`GET /apps/{id}`** · Auth: **Public**
Détail complet d'une application par son ID.

```bash
# Remplace 1 par un ID d'app existant
curl -s "https://noujoumstore.com/api/apps/1" | python3 -m json.tool
```

Réponse :
```json
{
  "id": 1,
  "name": "Mon App",
  "description": "Description complète",
  "version": "1.2.0",
  "size": "15 MB",
  "category": { "id": 1, "name": "Éducation" },
  "downloads": 1200,
  "rating": 4.5,
  "screenshots": ["url1", "url2"],
  "developer": { "id": 3, "name": "Ahmed" }
}
```

---

**`GET /apps/featured/list`** · Auth: **Public**
Applications mises en avant sur la page d'accueil.

```bash
curl -s "https://noujoumstore.com/api/apps/featured/list" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 3, "name": "App Featured", "is_featured": true }
  ]
}
```

---

**`GET /apps/most-downloaded/list`** · Auth: **Public**
Applications classées par nombre de téléchargements décroissant.

```bash
curl -s "https://noujoumstore.com/api/apps/most-downloaded/list" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 7, "name": "Top App", "downloads": 8500 }
  ]
}
```

---

**`GET /apps/top-rated/list`** · Auth: **Public**
Applications classées par note décroissante.

```bash
curl -s "https://noujoumstore.com/api/apps/top-rated/list" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 2, "name": "Best App", "rating": 4.9 }
  ]
}
```

---

**`GET /subscription/packages`** · Auth: **Public**
Liste des packages d'abonnement disponibles avec leurs prix.

```bash
curl -s "https://noujoumstore.com/api/subscription/packages" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 1, "name": "Gratuit", "price": 0, "features": ["5 apps", "Support email"] },
    { "id": 2, "name": "Pro", "price": 9.99, "features": ["Illimité", "Support 24/7"] }
  ]
}
```

---

**`GET /subscription/payment-info`** · Auth: **Public**
Informations sur les méthodes de paiement disponibles.

```bash
curl -s "https://noujoumstore.com/api/subscription/payment-info" | python3 -m json.tool
```

Réponse :
```json
{
  "methods": ["bank_transfer", "mobile_money"],
  "currency": "MRU",
  "instructions": "..."
}
```

---

**`GET /subscription/settings`** · Auth: **Public**
Paramètres généraux des abonnements.

```bash
curl -s "https://noujoumstore.com/api/subscription/settings" | python3 -m json.tool
```

Réponse :
```json
{ "trial_days": 14, "currency": "MRU", "auto_renew": true }
```

---

### 2.4 Routes Authentifiées — Token `$TOKEN` requis

> Assure-toi d'avoir exécuté la commande login (Section 2.2 Étape 3) avant ces tests.

**`GET /profile`** · Auth: **User**
Récupérer le profil complet de l'utilisateur actuellement connecté.

```bash
curl -s "https://noujoumstore.com/api/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "id": 5,
  "name": "Test Web Platform",
  "email": "test.web@yopmail.com",
  "avatar": null,
  "verified": true,
  "subscription": { "plan": "free", "expires_at": null }
}
```

---

**`PUT /profile`** · Auth: **User**
Modifier le profil de l'utilisateur. On renvoie les mêmes données pour tester sans rien changer.

```bash
curl -s -X PUT "https://noujoumstore.com/api/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name": "Test Web Platform"}' | python3 -m json.tool
```

Réponse :
```json
{
  "message": "Profile updated successfully",
  "user": { "id": 5, "name": "Test Web Platform" }
}
```

> Safe : on renvoie les mêmes données donc rien ne change réellement.

---

**`GET /my-apps`** · Auth: **User**
Lister toutes les applications publiées par l'utilisateur connecté.

```bash
curl -s "https://noujoumstore.com/api/my-apps" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 10, "name": "Mon App", "status": "approved", "downloads": 150 }
  ]
}
```

---

**`GET /subscription/status`** · Auth: **User**
Vérifier le statut de l'abonnement actuel de l'utilisateur connecté.

```bash
curl -s "https://noujoumstore.com/api/subscription/status" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "plan": "free",
  "status": "active",
  "expires_at": null,
  "features": ["5 apps max"]
}
```

---

**`GET /subscription/transactions`** · Auth: **User**
Historique des transactions de paiement de l'utilisateur connecté.

```bash
curl -s "https://noujoumstore.com/api/subscription/transactions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 1, "amount": 9.99, "status": "approved", "created_at": "2025-01-15" }
  ]
}
```

---

**`POST /logout`** · Auth: **User**
Déconnecter l'utilisateur et invalider le token.

```bash
curl -s -X POST "https://noujoumstore.com/api/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool

# Après ce test, le token est invalide — refais un login pour la suite
TOKEN=""
```

Réponse :
```json
{ "message": "Logged out successfully" }
```

> Exécute ce test en dernier — le token sera invalidé après.

---

### 2.5 Routes Admin — Token admin requis

> Ces routes nécessitent un compte avec rôle administrateur.

#### Connexion admin

**`POST /login`** · Auth: **Public**
Connexion avec le compte administrateur pour récupérer le token admin.

```bash
# Connexion admin
ADMIN_LOGIN=$(curl -s -X POST "https://noujoumstore.com/api/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"ADMIN_EMAIL","password":"ADMIN_PASSWORD"}')
echo $ADMIN_LOGIN | python3 -m json.tool

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('token',''))")
echo "ADMIN_TOKEN = $ADMIN_TOKEN"
```

Réponse :
```json
{
  "token": "2|admin_token_xyz...",
  "user": { "id": 1, "name": "Admin", "role": "admin" }
}
```

> Remplace `ADMIN_EMAIL` et `ADMIN_PASSWORD` par les vraies credentials admin.

---

**`GET /admin/stats`** · Auth: **Admin**
Statistiques complètes du dashboard administrateur.

```bash
curl -s "https://noujoumstore.com/api/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "total_users": 120,
  "total_apps": 45,
  "pending_apps": 3,
  "revenue": { "total": 1500, "monthly": 300 }
}
```

---

**`GET /admin/users`** · Auth: **Admin**
Liste de tous les utilisateurs de la plateforme.

```bash
curl -s "https://noujoumstore.com/api/admin/users" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 1, "name": "Ahmed", "email": "ahmed@...", "role": "user", "verified": true },
    { "id": 2, "name": "Sara", "email": "sara@...", "role": "user", "verified": false }
  ]
}
```

---

**`GET /admin/apps`** · Auth: **Admin**
Liste de toutes les applications (y compris en attente de validation).

```bash
curl -s "https://noujoumstore.com/api/admin/apps" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 1, "name": "Mon App", "status": "pending", "developer": "Ahmed" },
    { "id": 2, "name": "Top App", "status": "approved", "developer": "Sara" }
  ]
}
```

> Le champ `status` peut être : `pending`, `approved`, `rejected`.

---

**`GET /admin/settings`** · Auth: **Admin**
Tous les paramètres de configuration de la plateforme.

```bash
curl -s "https://noujoumstore.com/api/admin/settings" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 1, "key": "app_name", "value": "Noujoum Store", "group": "general" },
    { "id": 2, "key": "maintenance", "value": "false", "group": "general" }
  ]
}
```

---

**`GET /admin/settings/public`** · Auth: **Admin**
Settings accessibles publiquement (nom de l'app, logo, couleurs...).

```bash
curl -s "https://noujoumstore.com/api/admin/settings/public" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "app_name": "Noujoum Store",
  "logo_url": "https://noujoumstore.com/logo.png",
  "primary_color": "#D4500A"
}
```

---

**`GET /admin/subscription/stats`** · Auth: **Admin**
Statistiques des abonnements (revenus, conversions, plans actifs...).

```bash
curl -s "https://noujoumstore.com/api/admin/subscription/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "total_subscribers": 45,
  "monthly_revenue": 300,
  "by_plan": { "free": 80, "pro": 40, "enterprise": 5 }
}
```

---

**`GET /admin/subscription/transactions`** · Auth: **Admin**
Toutes les transactions de paiement de la plateforme.

```bash
curl -s "https://noujoumstore.com/api/admin/subscription/transactions" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool
```

Réponse :
```json
{
  "data": [
    { "id": 1, "user": "Ahmed", "amount": 9.99, "status": "pending", "created_at": "2025-06-15" }
  ]
}
```

---

## 3. INTÉGRATION DANS LE FRONTEND WEB

Une fois les APIs testées et validées, voici comment les intégrer dans Angular.

### Structure des services Angular à créer

| Fichier | Méthodes à créer |
|---------|------------------|
| `src/app/core/services/auth.service.ts` | `login()`, `logout()`, `register()`, `getProfile()` |
| `src/app/core/services/app.service.ts` | `getAll()`, `getById()`, `getFeatured()`, `getMostDownloaded()` |
| `src/app/core/services/category.service.ts` | `getAll()`, `getById()` |
| `src/app/core/services/subscription.service.ts` | `getPackages()`, `getStatus()`, `createPayment()` |
| `src/app/core/services/admin.service.ts` | `getStats()`, `getUsers()`, `getApps()`, `approveApp()` |
| `src/environments/environment.ts` | `apiUrl: 'https://noujoumstore.com/api'` |

### Exemple : `app.service.ts`

```typescript
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

@Injectable({ providedIn: 'root' })
export class AppService {
  private api = environment.apiUrl

  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.api}/apps`, { params })
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.api}/apps/${id}`)
  }

  getFeatured(): Observable<any> {
    return this.http.get(`${this.api}/apps/featured/list`)
  }
}
```

---

*Document généré pour Noujoum Store — Test APIs v1.0*
*57 endpoints • 3 niveaux d'auth • Laravel/Sanctum • https://noujoumstore.com*
