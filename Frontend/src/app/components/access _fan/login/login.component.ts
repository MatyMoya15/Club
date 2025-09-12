import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface User {
  dni: string;
  memberNumber: string;
  email: string;
  name: string;
  isFirstLogin: boolean;
}

interface Alert {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Forms
  loginForm!: FormGroup;
  resetForm!: FormGroup;
  
  // UI State
  showResetForm: boolean = false;
  showNewMemberFields: boolean = false;
  isLoading: boolean = false;
  alerts: Alert[] = [];
  
  // Password visibility
  passwordVisible: boolean = false;
  memberPasswordVisible: boolean = false;
  
  // Mock database - En producción esto vendría del backend
  private mockUsers: User[] = [
    {
      dni: '12345678',
      memberNumber: '001',
      email: 'socio1@club.com',
      name: 'Juan Pérez',
      isFirstLogin: true
    },
    {
      dni: '87654321',
      memberNumber: '002',
      email: 'socio2@club.com',
      name: 'María González',
      isFirstLogin: false
    }
  ];

  constructor(private fb: FormBuilder) {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Login form
    this.loginForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{7,8}$/)]],
      passwordOrMember: ['', [Validators.required, Validators.minLength(3)]],
      email: [''],
      password: ['']
    });

    // Reset form
    this.resetForm = this.fb.group({
      resetField: ['', [Validators.required]]
    });
  }

  // Alert methods
  showAlert(type: Alert['type'], message: string): void {
    this.alerts = [{ type, message }];
    
    // Auto-hide success and info alerts after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        this.clearAlerts();
      }, 5000);
    }
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  // Password visibility toggle
  togglePasswordVisibility(field: 'password' | 'memberPassword'): void {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else {
      this.memberPasswordVisible = !this.memberPasswordVisible;
    }
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string, form: FormGroup = this.loginForm): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, form: FormGroup = this.loginForm): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field.errors['pattern'] && fieldName === 'dni') {
      return 'DNI debe tener 7 u 8 dígitos';
    }
    if (field.errors['email']) {
      return 'Email debe tener un formato válido';
    }
    if (field.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'dni': 'DNI',
      'passwordOrMember': 'Contraseña o N° de Socio',
      'email': 'Email',
      'password': 'Contraseña',
      'resetField': 'DNI o Email'
    };
    return labels[fieldName] || fieldName;
  }

  // Login logic
  onLogin(): void {
    this.clearAlerts();
    
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      this.showAlert('error', 'Por favor, completá todos los campos correctamente');
      return;
    }

    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      this.processLogin();
    }, 1500);
  }

  private processLogin(): void {
    const dni = this.loginForm.get('dni')?.value;
    const passwordOrMember = this.loginForm.get('passwordOrMember')?.value;
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    // Find user by DNI
    const user = this.mockUsers.find(u => u.dni === dni);

    if (!user) {
      this.isLoading = false;
      this.showAlert('error', 'DNI no encontrado. Verificá el número ingresado.');
      return;
    }

    // Check if it's first login (using member number) or regular login
    if (this.showNewMemberFields) {
      // New member login with email and password
      if (this.validateNewMemberLogin(user, email, password)) {
        this.loginSuccess(user);
      } else {
        this.isLoading = false;
        this.showAlert('error', 'Email o contraseña incorrectos');
      }
    } else {
      // Existing member login
      if (this.validateExistingMemberLogin(user, passwordOrMember)) {
        if (user.isFirstLogin && passwordOrMember === user.memberNumber) {
          // First login with member number - show new member fields
          this.showNewMemberFields = true;
          this.isLoading = false;
          this.showAlert('info', 'Primer ingreso detectado. Por favor, completá tu email y nueva contraseña.');
          return;
        }
        this.loginSuccess(user);
      } else {
        this.isLoading = false;
        this.showAlert('error', 'Contraseña o número de socio incorrecto');
      }
    }
  }

  private validateExistingMemberLogin(user: User, passwordOrMember: string): boolean {
    // In a real app, you'd hash and compare passwords
    return passwordOrMember === user.memberNumber || 
           passwordOrMember === 'password123'; // Mock password
  }

  private validateNewMemberLogin(user: User, email: string, password: string): boolean {
    return email === user.email && password.length >= 6;
  }

  private loginSuccess(user: User): void {
    this.isLoading = false;
    this.showAlert('success', `¡Bienvenido, ${user.name}!`);
    
    // Mark user as not first login anymore
    user.isFirstLogin = false;
    
    // In a real app, you'd navigate to dashboard or save token
    console.log('Login successful:', user);
    
    // Simulate navigation after 2 seconds
    setTimeout(() => {
      // this.router.navigate(['/dashboard']);
      console.log('Redirecting to dashboard...');
    }, 2000);
  }

  // Password reset
showPasswordReset(): void {
  this.showResetForm = true;
  this.showNewMemberFields = false;
  this.clearAlerts();
  if (this.resetForm) {
    this.resetForm.reset();
  }
}

  showLoginForm(): void {
    this.showResetForm = false;
    this.showNewMemberFields = false;
    this.clearAlerts();
  }

  onPasswordReset(): void {
    this.clearAlerts();
    
    if (this.resetForm.invalid) {
      this.markFormGroupTouched(this.resetForm);
      this.showAlert('error', 'Por favor, ingresá un DNI o email válido');
      return;
    }

    this.isLoading = true;
    
    setTimeout(() => {
      const resetField = this.resetForm.get('resetField')?.value;
      const user = this.mockUsers.find(u => 
        u.dni === resetField || u.email.toLowerCase() === resetField.toLowerCase()
      );

      this.isLoading = false;

      if (user) {
        this.showAlert('success', 'Se han enviado las instrucciones para restablecer tu contraseña al email registrado.');
        this.resetForm.reset();
      } else {
        this.showAlert('error', 'No se encontró ninguna cuenta con ese DNI o email.');
      }
    }, 1500);
  }

  // Helper methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // Getters for template
  get isLoginButtonDisabled(): boolean {
    return this.isLoading || this.loginForm.invalid;
  }

  get isResetButtonDisabled(): boolean {
    return this.isLoading || this.resetForm.invalid;
  }

  get loginButtonText(): string {
    return this.isLoading ? 'Ingresando...' : 'Iniciar Sesión';
  }

  get resetButtonText(): string {
    return this.isLoading ? 'Enviando...' : 'Enviar Instrucciones';
  }
}