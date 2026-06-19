// Centralise TOUT l'accès au token JWT/Sanctum.
// Aucun autre fichier du projet ne doit appeler localStorage directement.

import { Injectable } from '@angular/core';

const TOKEN_KEY = 'noujoum_token';
const USER_KEY = 'noujoum_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  saveUser(user: unknown): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
