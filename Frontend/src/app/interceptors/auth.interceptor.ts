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
    // Rutas que NUNCA deben llevar token
    const isPublicGetNoticias = request.url.includes('/api/noticias') && request.method === 'GET';
    const isAuthRoute = request.url.includes('/api/auth/login') || 
                        request.url.includes('/api/auth/register');

    // Obtener token
    const token = this.authService.getToken();

    // ⚠️ IMPORTANTE: NO agregar token a peticiones GET de noticias
    if (token && !isPublicGetNoticias && !isAuthRoute) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('Token inválido o expirado. Redirigiendo al login...');
          this.authService.logout();
          this.router.navigate(['/access-fan']);
        }

        if (error.status === 403) {
          console.error('Acceso denegado:', error.error?.error || error.message);
          
          // Si es GET de noticias, dejar que el componente maneje el error
          if (isPublicGetNoticias) {
            return throwError(() => error);
          }
          
          // Para otras rutas, mostrar alerta y cerrar sesión
          alert(error.error?.error || 'Acceso denegado. Contacta al administrador.');
          this.authService.logout();
        }

        if (error.status === 0) {
          console.error('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
        }

        return throwError(() => error);
      })
    );
  }
}