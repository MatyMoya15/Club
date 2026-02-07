import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface Noticia {
  id_noticia: number;
  id_socio: number;
  titulo: string;
  subtitulo?: string;
  cuerpo: string;
  imagen?: string;
  creacion: string;
  actualizacion?: string;
  publicacion?: string;
  autor_nombre?: string;
  autor_apellido?: string;
}

export interface NoticiaForm {
  titulo: string;
  subtitulo?: string;
  cuerpo: string;
  imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoticiaService {
  private apiUrl = `${environment.apiUrl}/noticias`;
  
  // Cache local para evitar llamadas innecesarias
  private noticiasCache$ = new BehaviorSubject<Noticia[]>([]);
  private lastFetch: number = 0;
  private cacheDuration = 5 * 60 * 1000; // 5 minutos

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<{ url: string; public_id: string; message: string }> {
    const formData = new FormData();
    formData.append('imagen', file);
    
    return this.http.post<{ url: string; public_id: string; message: string }>(
      `${this.apiUrl}/upload-image`, 
      formData
    );
  }

  // GET /api/noticias - Con cache inteligente
  getAllNoticias(forceRefresh: boolean = false): Observable<Noticia[]> {
    const now = Date.now();
    const cacheValid = (now - this.lastFetch) < this.cacheDuration;

    // Si el cache es válido y no se fuerza refresh, retornar cache
    if (cacheValid && !forceRefresh && this.noticiasCache$.value.length > 0) {
      return this.noticiasCache$.asObservable();
    }

    // Hacer llamada al backend
    return this.http.get<Noticia[]>(this.apiUrl).pipe(
      tap(noticias => {
        this.noticiasCache$.next(noticias);
        this.lastFetch = now;
      })
    );
  }

  // GET /api/noticias/:id
  getNoticiaById(id: number): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.apiUrl}/${id}`);
  }

  // POST /api/noticias - Crear noticia
  createNoticia(data: NoticiaForm): Observable<{ message: string; noticia: Noticia }> {
    return this.http.post<{ message: string; noticia: Noticia }>(this.apiUrl, data).pipe(
      tap(response => {
        // Actualizar cache local sin hacer nueva llamada
        const currentNoticias = this.noticiasCache$.value;
        this.noticiasCache$.next([response.noticia, ...currentNoticias]);
      })
    );
  }

  // PUT /api/noticias/:id - Actualizar noticia
  updateNoticia(id: number, data: Partial<NoticiaForm>): Observable<{ message: string; noticia: Noticia }> {
    return this.http.put<{ message: string; noticia: Noticia }>(`${this.apiUrl}/${id}`, data).pipe(
      tap(response => {
        // Actualizar cache local
        const currentNoticias = this.noticiasCache$.value;
        const index = currentNoticias.findIndex(n => n.id_noticia === id);
        if (index !== -1) {
          currentNoticias[index] = response.noticia;
          this.noticiasCache$.next([...currentNoticias]);
        }
      })
    );
  }

  // DELETE /api/noticias/:id - Eliminar noticia
  deleteNoticia(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Remover del cache local
        const currentNoticias = this.noticiasCache$.value;
        this.noticiasCache$.next(currentNoticias.filter(n => n.id_noticia !== id));
      })
    );
  }

  // PATCH /api/noticias/:id/publish - Publicar noticia
  publishNoticia(id: number): Observable<{ message: string; noticia: Noticia }> {
    return this.http.patch<{ message: string; noticia: Noticia }>(`${this.apiUrl}/${id}/publish`, {}).pipe(
      tap(response => {
        // Actualizar cache local
        const currentNoticias = this.noticiasCache$.value;
        const index = currentNoticias.findIndex(n => n.id_noticia === id);
        if (index !== -1) {
          currentNoticias[index] = response.noticia;
          this.noticiasCache$.next([...currentNoticias]);
        }
      })
    );
  }

  // PATCH /api/noticias/:id/unpublish - Despublicar noticia
  unpublishNoticia(id: number): Observable<{ message: string; noticia: Noticia }> {
    return this.http.patch<{ message: string; noticia: Noticia }>(`${this.apiUrl}/${id}/unpublish`, {}).pipe(
      tap(response => {
        // Actualizar cache local
        const currentNoticias = this.noticiasCache$.value;
        const index = currentNoticias.findIndex(n => n.id_noticia === id);
        if (index !== -1) {
          currentNoticias[index] = response.noticia;
          this.noticiasCache$.next([...currentNoticias]);
        }
      })
    );
  }

  // Limpiar cache manualmente
  clearCache(): void {
    this.noticiasCache$.next([]);
    this.lastFetch = 0;
  }

  // Obtener noticias del cache (sin llamada HTTP)
  getNoticiasFromCache(): Noticia[] {
    return this.noticiasCache$.value;
  }

  // Observable del cache para subscripciones
  get noticias$(): Observable<Noticia[]> {
    return this.noticiasCache$.asObservable();
  }
}