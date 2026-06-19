import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/app.model';

export interface UploadResponse {
  url: string;
  path: string;
}

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_SIZE_MB = 5;

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Format non supporté. Utilise PNG, JPG ou WEBP.';
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`;
    }
    return null;
  }

  uploadSingle(file: File): Observable<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<UploadResponse>>(`${this.api}/upload`, formData);
  }

  uploadMultiple(files: File[]): Observable<ApiResponse<UploadResponse[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files[]', file));
    return this.http.post<ApiResponse<UploadResponse[]>>(`${this.api}/upload-multiple`, formData);
  }

  deleteFile(path: string): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(`${this.api}/upload`, { body: { path } });
  }
}
