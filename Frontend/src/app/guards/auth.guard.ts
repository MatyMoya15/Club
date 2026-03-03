import { Injectable } from '@angular/core';
import
  {
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
export class AuthGuard
{
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
  {

    const currentUser = this.authService.currentUserValue;
    const isLoggedIn = this.authService.isLoggedIn();

    if (currentUser && isLoggedIn)
    {
      const requiredRoles = route.data['roles'] as Array<string>;

      if (requiredRoles && requiredRoles.length > 0)
      {
        if (requiredRoles.includes(currentUser.rol))
        {
          return true;
        } else
        {
          console.warn('Usuario sin permisos para acceder a esta ruta');
          this.router.navigate(['/dashboard']);
          return false;
        }
      }

      return true;
    }

    console.log('Usuario no autenticado. Redirigiendo al login...');
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}