// src/app/components/access _fan/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

interface Alert {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Forms
  loginForm!: FormGroup;
  resetForm!: FormGroup;
  
  // UI State
  showResetForm: boolean = false;
  isLoading: boolean = false;
  alerts: Alert[] = [];
  returnUrl: string = '';
  
  // Password visibility
  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Si ya está logueado, redirigir
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/socio']);
    }
  }

  ngOnInit(): void {
    this.initializeForms();
    
    // Obtener la URL de retorno o usar /socio por defecto
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/socio';
  }

  // ✅ Método para redirigir al home
  redirectToHome(): void {
    this.router.navigate(['/']);
  }

  // Alert methods
  showAlert(type: Alert['type'], message: string): void {
    this.alerts = [{ type, message }];
    
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
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string, form: FormGroup = this.loginForm): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }


private initializeForms(): void {
  // Login form - adaptado para DNI o Email
  this.loginForm = this.fb.group({
    identifier: ['', [Validators.required]], // ✅ Cambio aquí
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // Reset form
  this.resetForm = this.fb.group({
    resetField: ['', [Validators.required]]
  });
}

// ✅ Actualizar labels
private getFieldLabel(fieldName: string): string {
  const labels: { [key: string]: string } = {
    'identifier': 'DNI o Email', // ✅ Cambio aquí
    'password': 'Contraseña',
    'resetField': 'Email o DNI'
  };
  return labels[fieldName] || fieldName;
}

// ✅ Actualizar validación de email
getFieldError(fieldName: string, form: FormGroup = this.loginForm): string {
  const field = form.get(fieldName);
  if (!field || !field.errors) return '';

  if (field.errors['required']) {
    return `${this.getFieldLabel(fieldName)} es requerido`;
  }
  // ❌ Remover validación de email ya que ahora acepta DNI también
  if (field.errors['minlength']) {
    return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
  }

  return 'Campo inválido';
}

// ✅ Actualizar onLogin
onLogin(): void {
  this.clearAlerts();
  
  if (this.loginForm.invalid) {
    this.markFormGroupTouched(this.loginForm);
    this.showAlert('error', 'Por favor, completá todos los campos correctamente');
    return;
  }

  this.isLoading = true;
  
  const credentials = {
    identifier: this.loginForm.get('identifier')?.value, // ✅ Cambio aquí
    password: this.loginForm.get('password')?.value
  };

  this.authService.login(credentials).subscribe({
    next: (response) => {
      this.isLoading = false;
      console.log('Login exitoso:', response);
      
      // ✅ Verificar si es primer login
      if (response.primerLogin) {
        this.showAlert('info', 'Por seguridad, debés cambiar tu contraseña');
        setTimeout(() => {
          this.router.navigate(['/cambiar-password']); // Ruta para cambiar password
        }, 2000);
        return;
      }
      
      this.showAlert('success', `¡Bienvenido, ${response.user.nombre} ${response.user.apellido}!`);
      
      setTimeout(() => {
        this.router.navigate([this.returnUrl]);
      }, 1000);
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Error en login:', error);
      
      if (error.status === 401) {
        this.showAlert('error', 'DNI/Email o contraseña incorrectos');
      } else if (error.status === 403) {
        this.showAlert('error', error.error?.error || 'Cuenta desactivada. Contactá al administrador');
      } else if (error.status === 0) {
        this.showAlert('error', 'No se pudo conectar con el servidor. Verificá tu conexión.');
      } else {
        this.showAlert('error', error.error?.error || 'Error al iniciar sesión. Intentá nuevamente.');
      }
    }
  });
}
  // Password reset
  showPasswordReset(): void {
    this.showResetForm = true;
    this.clearAlerts();
    if (this.resetForm) {
      this.resetForm.reset();
    }
  }

  showLoginForm(): void {
    this.showResetForm = false;
    this.clearAlerts();
  }

  onPasswordReset(): void {
    this.clearAlerts();
    
    if (this.resetForm.invalid) {
      this.markFormGroupTouched(this.resetForm);
      this.showAlert('error', 'Por favor, ingresá un email válido');
      return;
    }

    this.isLoading = true;
    
    // TODO: Implementar endpoint de reset password en el backend
    // Por ahora solo simulamos
    setTimeout(() => {
      this.isLoading = false;
      this.showAlert('success', 'Se han enviado las instrucciones para restablecer tu contraseña al email registrado.');
      this.resetForm.reset();
      
      // Volver al login después de 3 segundos
      setTimeout(() => {
        this.showLoginForm();
      }, 3000);
    }, 1500);
  }

  // Helper methods
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // Getters para el template
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