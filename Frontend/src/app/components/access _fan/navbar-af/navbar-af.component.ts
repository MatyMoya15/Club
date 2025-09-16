import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navbar-af',
  templateUrl: './navbar-af.component.html',
  styleUrls: ['./navbar-af.component.css']
})
export class NavbarAfComponent {
  @Input() isLoggedIn: boolean = false;
  @Input() userName: string = '';
  @Input() showBackButton: boolean = false;
  
  @Output() logout = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();

  onLogout() {
    this.logout.emit();
  }

  onGoBack() {
    this.goBack.emit();
  }

  onGoHome() {
    this.goHome.emit();
  }
}
