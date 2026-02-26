import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-socio',
  templateUrl: './socio.component.html',
  styleUrls: ['./socio.component.css']
})
export class SocioComponent implements OnInit
{
  isAdmin = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void
  {
    // Obtener el rol del usuario actual
    this.isAdmin = this.authService.isAdmin();
  }

  logout(): void
  {
    console.log('Cerrando sesión...');
    this.authService.logout();
    this.router.navigate(['/access-fan']);
  }

  sidebarOpen = false;

toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
  console.log('Sidebar state:', this.sidebarOpen);
}
  closeSidebar()
  {
    this.sidebarOpen = false;
    document.body.style.overflow = '';
  }

  ngOnDestroy()
  {
    document.body.style.overflow = '';
  }
}