import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Deporte {
  id_deportes: number;
  nombre: string;
  descripcion?: string;
  monto_mensual: number;
}

export interface Clase {
  id_clase: number;
  id_deporte: number;
  id_instructor?: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  cancha?: string;
  activa: boolean;
  deporte_nombre?: string;
  instructor_nombre?: string;
  instructor_apellido?: string;
  instructor_categoria?: string;
}

export interface Instructor {
  id_instructores: number;
  nombre: string;
  apellido: string;
  categoria?: string;
  activo: boolean;
  fecha_alta: string;
  total_clases?: number;
}

export interface DeporteCompleto {
  deporte: Deporte;
  clases: Clase[];
  instructores: Instructor[];
}

export interface CreateDeporteRequest {
  nombre: string;
  descripcion?: string;
  monto_mensual?: number;
}

export interface UpdateDeporteRequest {
  nombre?: string;
  descripcion?: string;
  monto_mensual?: number;
}

export interface CreateClaseRequest {
  id_instructor?: number;
  id_deporte: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  cancha?: string;
}

export interface UpdateClaseRequest {
  id_instructor?: number;
  id_deporte?: number;
  dia?: string;
  hora_inicio?: string;
  hora_fin?: string;
  cancha?: string;
}

export interface CreateInstructorRequest {
  nombre: string;
  apellido: string;
  categoria?: string;
  activo?: boolean;
}

export interface UpdateInstructorRequest {
  nombre?: string;
  apellido?: string;
  categoria?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class DeporteService {
  private apiUrl = `${environment.apiUrl}/deportes`;
  private clasesUrl = `${environment.apiUrl}/clases`;
  private instructoresUrl = `${environment.apiUrl}/instructores`;

  constructor(private http: HttpClient) {}

  // ==================== DEPORTES ====================

  // GET /api/deportes - Obtener todos los deportes
  getAllDeportes(): Observable<Deporte[]> {
    return this.http.get<Deporte[]>(this.apiUrl);
  }

  // GET /api/deportes/:id - Obtener deporte por ID
  getDeporteById(id: number): Observable<Deporte> {
    return this.http.get<Deporte>(`${this.apiUrl}/${id}`);
  }

  // POST /api/deportes - Crear nuevo deporte
  createDeporte(
    data: CreateDeporteRequest
  ): Observable<{ message: string; deporte: Deporte }> {
    return this.http.post<{ message: string; deporte: Deporte }>(
      this.apiUrl,
      data
    );
  }

  // PUT /api/deportes/:id - Actualizar deporte
  updateDeporte(
    id: number,
    data: UpdateDeporteRequest
  ): Observable<{ message: string; deporte: Deporte }> {
    return this.http.put<{ message: string; deporte: Deporte }>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  // DELETE /api/deportes/:id - Eliminar deporte
  deleteDeporte(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // ==================== CLASES ====================

  // GET /api/clases - Obtener todas las clases
  getAllClases(activa?: boolean, dia?: string): Observable<Clase[]> {
    let params = new HttpParams();

    if (activa !== undefined) {
      params = params.set('activa', activa.toString());
    }

    if (dia) {
      params = params.set('dia', dia);
    }

    return this.http.get<Clase[]>(this.clasesUrl, { params });
  }

  // GET /api/clases/:id - Obtener clase por ID
  getClaseById(id: number): Observable<Clase> {
    return this.http.get<Clase>(`${this.clasesUrl}/${id}`);
  }

  // GET /api/clases/deporte/:deporteId - Obtener clases por deporte
  getClasesByDeporte(deporteId: number): Observable<Clase[]> {
    return this.http.get<Clase[]>(`${this.clasesUrl}/deporte/${deporteId}`);
  }

  // GET /api/clases/instructor/:instructorId - Obtener clases por instructor
  getClasesByInstructor(instructorId: number): Observable<Clase[]> {
    return this.http.get<Clase[]>(
      `${this.clasesUrl}/instructor/${instructorId}`
    );
  }

  // POST /api/clases - Crear nueva clase
  createClase(
    data: CreateClaseRequest
  ): Observable<{ message: string; clase: Clase }> {
    return this.http.post<{ message: string; clase: Clase }>(
      this.clasesUrl,
      data
    );
  }

  // PUT /api/clases/:id - Actualizar clase
  updateClase(
    id: number,
    data: UpdateClaseRequest
  ): Observable<{ message: string; clase: Clase }> {
    return this.http.put<{ message: string; clase: Clase }>(
      `${this.clasesUrl}/${id}`,
      data
    );
  }

  // DELETE /api/clases/:id - Eliminar clase
  deleteClase(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.clasesUrl}/${id}`);
  }

  // PATCH /api/clases/:id/toggle - Activar/desactivar clase
  toggleClase(id: number): Observable<{ message: string; clase: Clase }> {
    return this.http.patch<{ message: string; clase: Clase }>(
      `${this.clasesUrl}/${id}/toggle`,
      {}
    );
  }

  // ==================== INSTRUCTORES ====================

  // GET /api/instructores - Obtener todos los instructores
  getAllInstructores(activo?: boolean): Observable<Instructor[]> {
    let params = new HttpParams();

    if (activo !== undefined) {
      params = params.set('activo', activo.toString());
    }

    return this.http.get<Instructor[]>(this.instructoresUrl, { params });
  }

  // GET /api/instructores/:id - Obtener instructor por ID
  getInstructorById(id: number): Observable<Instructor> {
    return this.http.get<Instructor>(`${this.instructoresUrl}/${id}`);
  }

  // ==================== MÉTODOS COMPUESTOS ====================

  // Obtener información completa de un deporte (con clases e instructores)
  getDeporteCompleto(id: number): Observable<DeporteCompleto> {
    return new Observable((observer) => {
      // Obtener el deporte
      this.getDeporteById(id).subscribe({
        next: (deporte) => {
          // Obtener las clases del deporte
          this.getClasesByDeporte(id).subscribe({
            next: (clases) => {
              // Obtener todos los instructores activos
              this.getAllInstructores(true).subscribe({
                next: (instructores) => {
                  observer.next({
                    deporte,
                    clases,
                    instructores,
                  });
                  observer.complete();
                },
                error: (err) => observer.error(err),
              });
            },
            error: (err) => observer.error(err),
          });
        },
        error: (err) => observer.error(err),
      });
    });
  }

  // Obtener horarios agrupados por día
  getHorariosAgrupadosPorDia(clases: Clase[]): { [dia: string]: Clase[] } {
    const horariosAgrupados: { [dia: string]: Clase[] } = {};

    clases.forEach((clase) => {
      if (!horariosAgrupados[clase.dia]) {
        horariosAgrupados[clase.dia] = [];
      }
      horariosAgrupados[clase.dia].push(clase);
    });

    // Ordenar por hora de inicio
    Object.keys(horariosAgrupados).forEach((dia) => {
      horariosAgrupados[dia].sort((a, b) =>
        a.hora_inicio.localeCompare(b.hora_inicio)
      );
    });

    return horariosAgrupados;
  }

  // Formatear hora para mostrar
  formatearHora(hora: string): string {
    return hora.substring(0, 5); // Extrae HH:MM
  }

  // Obtener nombre completo del instructor
  getNombreInstructor(clase: Clase): string {
    if (clase.instructor_nombre && clase.instructor_apellido) {
      return `${clase.instructor_nombre} ${clase.instructor_apellido}`;
    }
    return 'Sin instructor asignado';
  }

  createInstructor(
    data: CreateInstructorRequest
  ): Observable<{ message: string; instructor: Instructor }> {
    return this.http.post<{ message: string; instructor: Instructor }>(
      this.instructoresUrl,
      data
    );
  }

  // PUT /api/instructores/:id - Actualizar instructor
  updateInstructor(
    id: number,
    data: UpdateInstructorRequest
  ): Observable<{ message: string; instructor: Instructor }> {
    return this.http.put<{ message: string; instructor: Instructor }>(
      `${this.instructoresUrl}/${id}`,
      data
    );
  }

  // DELETE /api/instructores/:id - Desactivar instructor
  deleteInstructor(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.instructoresUrl}/${id}`
    );
  }

  // PATCH /api/instructores/:id/activate - Activar instructor
  activateInstructor(id: number): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(
      `${this.instructoresUrl}/${id}/activate`,
      {}
    );
  }
}
