import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtener el token del servicio de autenticación
    const token = this.authService.getToken();
    
    // Clonar la petición y agregar el header Authorization si existe el token
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Continuar con la petición y manejar errores
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es 401 (No autorizado) o 403 (Cuenta desactivada)
        if (error.status === 401) {
          console.error('Token inválido o expirado. Redirigiendo al login...');
          this.authService.logout();
        }

        // Si el error es 403 (Forbidden - cuenta desactivada)
        if (error.status === 403) {
          console.error('Cuenta desactivada:', error.error.error);
          alert(error.error.error || 'Tu cuenta está desactivada. Contacta al administrador.');
          this.authService.logout();
        }

        // Si hay error de conexión
        if (error.status === 0) {
          console.error('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
        }

        return throwError(() => error);
      })
    );
  }
}