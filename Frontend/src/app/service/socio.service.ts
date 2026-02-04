import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Socio {
  id_socio: number;
  numero_socio: string;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  direccion?: string;
  fecha_alta: string;
  activo: boolean;
  rol: string;
}

export interface UpdateSocioRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  password?: string;
}

export interface UpdateSocioResponse {
  message: string;
  socio: Socio;
}

@Injectable({
  providedIn: 'root'
})
export class SocioService {
  private apiUrl = `${environment.apiUrl}/socios`;

  constructor(private http: HttpClient) {}

  getAllSocios(activo?: boolean, search?: string): Observable<Socio[]> {
    let params = new HttpParams();
    
    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }
    
    if (search) {
      params = params.set('search', search);
    }
    
    return this.http.get<Socio[]>(this.apiUrl, { params });
  }

  getSocioById(id: number): Observable<Socio> {
    return this.http.get<Socio>(`${this.apiUrl}/${id}`);
  }

  updateSocio(id: number, data: UpdateSocioRequest): Observable<UpdateSocioResponse> {
    return this.http.put<UpdateSocioResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteSocio(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  activateSocio(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/activate`, {});
  }

  updateMiPerfil(data: UpdateSocioRequest): Observable<UpdateSocioResponse> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = currentUser.id_socio;
    
    if (!userId) {
      throw new Error('No se encontró el ID del usuario');
    }
    
    return this.updateSocio(userId, data);
  }
}