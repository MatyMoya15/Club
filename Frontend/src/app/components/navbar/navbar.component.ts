import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  showNavbar: boolean = true;
  isMobileMenuOpen: boolean = false;
  mobileMenuIcon: string = 'fas fa-bars';

  dropdowns = {
    socios: false,
    elclub: false
  };

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.mobileMenuIcon = this.isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars';
    
    if (!this.isMobileMenuOpen) {
      this.closeAllDropdowns();
    }
  }

  toggleDropdown(event: Event, dropdownName: string): void {
    if (this.isMobile()) {
      event.preventDefault();
      this.dropdowns[dropdownName as keyof typeof this.dropdowns] = 
        !this.dropdowns[dropdownName as keyof typeof this.dropdowns];
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  closeMobileMenuOnLinkClick(): void {
    if (this.isMobile()) {
      this.isMobileMenuOpen = false;
      this.mobileMenuIcon = 'fas fa-bars';
      this.closeAllDropdowns();
    }
  }

  private closeAllDropdowns(): void {
    this.dropdowns.socios = false;
    this.dropdowns.elclub = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (!this.isMobile() && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
      this.mobileMenuIcon = 'fas fa-bars';
      this.closeAllDropdowns();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.closeAllDropdowns();
    }
  }

}