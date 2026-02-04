import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'CSYDVM';
  mostrarLayout = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        
        // Ocultar layout en rutas de autenticación y área de socio
        this.mostrarLayout = !(
          url === '/asociarme' || 
          url === '/access-fan' ||
          url.startsWith('/socio') // Todas las rutas que empiecen con /socio
        );
      }
    });
  }
}