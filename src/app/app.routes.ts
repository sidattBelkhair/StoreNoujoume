import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'apps',
    loadComponent: () => import('./features/catalog/app-list/app-list').then((m) => m.AppList),
  },
  {
    path: 'apps/:id',
    loadComponent: () => import('./features/catalog/app-detail/app-detail').then((m) => m.AppDetail),
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/categories').then((m) => m.Categories),
  },
  {
    path: 'categories/:id',
    loadComponent: () =>
      import('./features/categories/category-detail/category-detail').then((m) => m.CategoryDetail),
  },
  {
    path: 'rechercher',
    loadComponent: () => import('./features/search/search').then((m) => m.Search),
  },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'verifier-email',
    loadComponent: () => import('./features/auth/verify-email/verify-email').then((m) => m.VerifyEmail),
  },
  {
    path: 'tableau-de-bord',
    loadComponent: () => import('./features/developer/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'publier-une-app',
    loadComponent: () => import('./features/developer/publish-app/publish-app').then((m) => m.PublishApp),
    canActivate: [authGuard],
  },
  {
    path: 'publier-une-app/:id',
    loadComponent: () => import('./features/developer/publish-app/publish-app').then((m) => m.PublishApp),
    canActivate: [authGuard],
  },
  {
    path: 'abonnement',
    loadComponent: () => import('./features/developer/subscription/subscription').then((m) => m.Subscription),
    canActivate: [authGuard],
  },
  {
    path: 'paiements',
    loadComponent: () =>
      import('./features/developer/payment-history/payment-history').then((m) => m.PaymentHistory),
    canActivate: [authGuard],
  },
  {
    path: 'profil',
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'conditions-utilisation',
    loadComponent: () => import('./features/legal/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'politique-confidentialite',
    loadComponent: () => import('./features/legal/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
