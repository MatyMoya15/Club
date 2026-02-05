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
export class AdminGuard {
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
    
    if (isLoggedIn && currentUser && currentUser.rol === 'admin') {
      return true;
    }

    // No es admin - redirigir al dashboard
    console.warn('Acceso denegado. Se requieren permisos de administrador.');
    this.router.navigate(['/dashboard']);
    return false;
  }
}