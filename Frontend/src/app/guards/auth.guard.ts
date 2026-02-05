import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    const currentUser = this.authService.currentUserValue;
    const isLoggedIn = this.authService.isLoggedIn();
    
    if (currentUser && isLoggedIn) {
      // Verificar si la ruta requiere un rol específico
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles && requiredRoles.length > 0) {
        // Verificar si el usuario tiene el rol requerido
        if (requiredRoles.includes(currentUser.rol)) {
          return true;
        } else {
          // Usuario autenticado pero sin permisos
          console.warn('Usuario sin permisos para acceder a esta ruta');
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      // Usuario autenticado y sin restricciones de rol
      return true;
    }

    // No autenticado - redirigir al login guardando la URL solicitada
    console.log('Usuario no autenticado. Redirigiendo al login...');
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}