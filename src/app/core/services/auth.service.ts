import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  VerifyEmailPayload,
} from '../models/user.model';
import { ApiResponse } from '../models/app.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) {
    this.currentUser.set(this.tokenStorage.getUser<User>());
    this.isAuthenticated.set(this.tokenStorage.isLoggedIn());
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, payload);
  }

  verifyEmail(payload: VerifyEmailPayload): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/verify-email`, payload);
  }

  resendVerification(email: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/resend-verification`, { email });
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/login`, payload).pipe(
      tap((res) => {
        if (res?.data?.token) {
          this.tokenStorage.saveToken(res.data.token);
          this.tokenStorage.saveUser(res.data.user);
          this.currentUser.set(res.data.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/logout`, {}).pipe(
      tap(() => this.clearLocalSession())
    );
  }

  clearLocalSession(): void {
    this.tokenStorage.clear();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  getProfile(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.api}/profile`).pipe(
      tap((res) => {
        if (res?.data) {
          this.tokenStorage.saveUser(res.data);
          this.currentUser.set(res.data);
        }
      })
    );
  }

  updateProfile(payload: Partial<User>): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.api}/profile`, payload).pipe(
      tap((res) => {
        if (res?.data) {
          this.tokenStorage.saveUser(res.data);
          this.currentUser.set(res.data);
        }
      })
    );
  }
}
