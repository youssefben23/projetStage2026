import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EmailTemplate,
  TemplateCreateRequest,
  TemplateUpdateRequest,
  TemplateListResponse,
  ValidationResult
} from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getTemplates(page: number = 1, perPage: number = 20, includeInactive: boolean = false): Observable<TemplateListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString())
      .set('include_inactive', includeInactive.toString());

    return this.http.get<TemplateListResponse>(`${this.apiUrl}/templates`, { params });
  }

  getTemplate(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/templates/${id}`);
  }

  createTemplate(data: TemplateCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/templates`, data);
  }

  updateTemplate(id: number, data: TemplateUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/templates/${id}`, data);
  }

  deleteTemplate(id: number, soft: boolean = true): Observable<any> {
    const params = new HttpParams().set('soft', soft.toString());
    return this.http.delete<any>(`${this.apiUrl}/templates/${id}`, { params });
  }

  searchTemplates(query: string, page: number = 1, perPage: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<any>(`${this.apiUrl}/templates/search`, { params });
  }

  duplicateTemplate(id: number, newName?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/templates/${id}/duplicate`, { new_name: newName });
  }

  validateTemplate(id: number): Observable<{ success: boolean; validation: ValidationResult }> {
    return this.http.post<{ success: boolean; validation: ValidationResult }>(
      `${this.apiUrl}/templates/${id}/validate`,
      {}
    );
  }

  getTemplatePreview(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/templates/${id}/preview`);
  }

  getTemplateVersions(id: number, page: number = 1, perPage: number = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    return this.http.get<any>(`${this.apiUrl}/templates/${id}/versions`, { params });
  }

  getTemplateVersion(id: number, versionNumber: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/templates/${id}/versions/${versionNumber}`);
  }

  restoreVersion(id: number, versionNumber: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/templates/${id}/versions/${versionNumber}/restore`, {});
  }

  compareVersions(id: number, v1: number, v2: number): Observable<any> {
    let params = new HttpParams()
      .set('v1', v1.toString())
      .set('v2', v2.toString());

    return this.http.get<any>(`${this.apiUrl}/templates/${id}/versions/compare`, { params });
  }

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/templates/statistics`);
  }
}
