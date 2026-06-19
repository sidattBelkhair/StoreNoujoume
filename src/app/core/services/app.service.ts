import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppCreatePayload,
  ApiResponse,
  NoujoumApp,
  PaginatedResponse,
} from '../models/app.model';

export interface AppListFilters {
  page?: number;
  per_page?: number;
  category_id?: number;
  search?: string;
  sort?: 'recent' | 'downloads' | 'rating';
}

@Injectable({ providedIn: 'root' })
export class AppService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private buildParams(filters: AppListFilters = {}): HttpParams {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  getAll(filters: AppListFilters = {}): Observable<PaginatedResponse<NoujoumApp>> {
    return this.http.get<PaginatedResponse<NoujoumApp>>(`${this.api}/apps`, {
      params: this.buildParams(filters),
    });
  }

  getById(id: number): Observable<ApiResponse<NoujoumApp>> {
    return this.http.get<ApiResponse<NoujoumApp>>(`${this.api}/apps/${id}`);
  }

  // /featured, /most-downloaded et /top-rated renvoient un tableau brut sous data
  // (pas de pagination Laravel imbriquée, contrairement à /apps et /my-apps).
  getFeatured(): Observable<ApiResponse<NoujoumApp[]>> {
    return this.http.get<ApiResponse<NoujoumApp[]>>(`${this.api}/apps/featured/list`);
  }

  getMostDownloaded(): Observable<ApiResponse<NoujoumApp[]>> {
    return this.http.get<ApiResponse<NoujoumApp[]>>(`${this.api}/apps/most-downloaded/list`);
  }

  getTopRated(): Observable<ApiResponse<NoujoumApp[]>> {
    return this.http.get<ApiResponse<NoujoumApp[]>>(`${this.api}/apps/top-rated/list`);
  }

  getStats(): Observable<ApiResponse<{ total_apps: number; total_developers: number }>> {
    return this.http.get<ApiResponse<{ total_apps: number; total_developers: number }>>(
      `${this.api}/stats`
    );
  }

  getMyApps(): Observable<PaginatedResponse<NoujoumApp>> {
    return this.http.get<PaginatedResponse<NoujoumApp>>(`${this.api}/my-apps`);
  }

  create(payload: AppCreatePayload): Observable<ApiResponse<NoujoumApp>> {
    return this.http.post<ApiResponse<NoujoumApp>>(`${this.api}/apps`, payload);
  }

  update(id: number, payload: Partial<AppCreatePayload>): Observable<ApiResponse<NoujoumApp>> {
    return this.http.put<ApiResponse<NoujoumApp>>(`${this.api}/apps/${id}`, payload);
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/apps/${id}`);
  }
}
