import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppCategory, ApiResponse } from '../models/app.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /categories renvoie un tableau brut sous data (pas de pagination Laravel
  // imbriquée ici, contrairement à /apps) — vérifié par test curl le 19/06/2026.
  getAll(): Observable<ApiResponse<AppCategory[]>> {
    return this.http.get<ApiResponse<AppCategory[]>>(`${this.api}/categories`);
  }

  getById(id: number): Observable<ApiResponse<AppCategory>> {
    return this.http.get<ApiResponse<AppCategory>>(`${this.api}/categories/${id}`);
  }
}
