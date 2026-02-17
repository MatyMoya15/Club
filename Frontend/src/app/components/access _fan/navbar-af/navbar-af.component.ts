import { Component, EventEmitter, Input, Output } from '@angular/core';

export type PageType = 'login' | 'register' | 'profile' | 'dashboard' | 'other';

@Component({
  selector: 'app-navbar-af',
  templateUrl: './navbar-af.component.html',
  styleUrls: ['./navbar-af.component.css']
})
export class NavbarAfComponent {
  @Input() isLoggedIn: boolean = false;
  @Input() userName: string = '';
  @Input() userStatus: string = '';
  @Input() showBackButton: boolean = false;
  @Input() currentPage: PageType = 'other';
  
  @Output() logout = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();
  @Output() goToLogin = new EventEmitter<void>();
  @Output() goToRegister = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }

  onGoBack() {
    this.goBack.emit();
  }

  onGoHome() {
    this.goHome.emit();
  }

  onGoToLogin() {
    this.goToLogin.emit();
  }

  onGoToRegister() {
    this.goToRegister.emit();
  }

  // Obtiene las iniciales del usuario para el avatar
  getUserInitials(): string {
    if (!this.userName) return '?';
    
    const names = this.userName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  }

  // Obtiene el subtítulo contextual según la página actual
  getContextSubtitle(): string {
    switch (this.currentPage) {
      case 'login':
        return 'Iniciar Sesión';
      case 'register':
        return 'Registro';
      case 'profile':
        return 'Mi Perfil';
      case 'dashboard':
        return 'Panel Socio';
      default:
        return 'Zona Socio';
    }
  }
}