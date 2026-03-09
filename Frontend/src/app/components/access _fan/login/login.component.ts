import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { Location } from '@angular/common';

interface Alert
{
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit
{
  loginForm!: FormGroup;
  resetForm!: FormGroup;

  showResetForm: boolean = false;
  isLoading: boolean = false;
  alerts: Alert[] = [];
  returnUrl: string = '';

  passwordVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private location: Location
  )
  {
    if (this.authService.isLoggedIn())
    {
      this.router.navigate(['/socio']);
    }
  }

  ngOnInit(): void
  {
    this.initializeForms();

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/socio';
  }

  private initializeForms(): void
  {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.resetForm = this.fb.group({
      resetField: ['', [Validators.required]]
    });
  }

  redirectToHome(): void
  {
    this.router.navigate(['/']);
  }

  showAlert(type: Alert['type'], message: string): void
  {
    this.alerts = [{ type, message }];

    if (type === 'success' || type === 'info')
    {
      setTimeout(() =>
      {
        this.clearAlerts();
      }, 5000);
    }
  }

  clearAlerts(): void
  {
    this.alerts = [];
  }

  togglePasswordVisibility(): void
  {
    this.passwordVisible = !this.passwordVisible;
  }

  isFieldInvalid(fieldName: string, form: FormGroup = this.loginForm): boolean
  {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private getFieldLabel(fieldName: string): string
  {
    const labels: { [key: string]: string } = {
      'identifier': 'DNI o Email',
      'password': 'Contraseña',
      'resetField': 'Email o DNI'
    };
    return labels[fieldName] || fieldName;
  }

  getFieldError(fieldName: string, form: FormGroup = this.loginForm): string
  {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required'])
    {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field.errors['minlength'])
    {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  onLogin(): void
  {
    this.clearAlerts();

    if (this.loginForm.invalid)
    {
      this.markFormGroupTouched(this.loginForm);
      this.showAlert('error', 'Por favor, completá todos los campos correctamente');
      return;
    }

    this.isLoading = true;

    const credentials = {
      identifier: this.loginForm.get('identifier')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(credentials).subscribe({
      next: (response) =>
      {
        this.isLoading = false;

        if (response.primerLogin)
        {
          this.showAlert('info', 'Por seguridad, debés cambiar tu contraseña predeterminada');
          setTimeout(() =>
          {
            this.router.navigate(['/socio/perfil'], {
              queryParams: { cambiarPassword: true }
            });
          }, 2000);
          return;
        }

        this.showAlert('success', `¡Bienvenido, ${response.user.nombre} ${response.user.apellido}!`);

        setTimeout(() =>
        {
          this.router.navigate([this.returnUrl]);
        }, 1000);
      },
      error: (error) =>
      {
        this.isLoading = false;
        console.error('Error en login:', error);

        if (error.status === 401)
        {
          this.showAlert('error', 'DNI/Email o contraseña incorrectos');
        } else if (error.status === 403)
        {
          this.showAlert('error', error.error?.error || 'Cuenta desactivada. Contactá al administrador');
        } else if (error.status === 0)
        {
          this.showAlert('error', 'No se pudo conectar con el servidor. Verificá tu conexión.');
        } else
        {
          this.showAlert('error', error.error?.error || 'Error al iniciar sesión. Intentá nuevamente.');
        }
      }
    });
  }

  showPasswordReset(): void
  {
    this.showResetForm = true;
    this.clearAlerts();
    if (this.resetForm)
    {
      this.resetForm.reset();
    }
  }

  showLoginForm(): void
  {
    this.showResetForm = false;
    this.clearAlerts();
  }

  onPasswordReset(): void
  {
    this.clearAlerts();

    if (this.resetForm.invalid)
    {
      this.markFormGroupTouched(this.resetForm);
      this.showAlert('error', 'Por favor, ingresá un email o DNI válido');
      return;
    }

    this.isLoading = true;

    setTimeout(() =>
    {
      this.isLoading = false;
      this.showAlert('success', 'Se han enviado las instrucciones para restablecer tu contraseña.');
      this.resetForm.reset();

      setTimeout(() =>
      {
        this.showLoginForm();
      }, 3000);
    }, 1500);
  }

  private markFormGroupTouched(formGroup: FormGroup): void
  {
    Object.keys(formGroup.controls).forEach(field =>
    {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  get isLoginButtonDisabled(): boolean
  {
    return this.isLoading || this.loginForm.invalid;
  }

  get isResetButtonDisabled(): boolean
  {
    return this.isLoading || this.resetForm.invalid;
  }

  get loginButtonText(): string
  {
    return this.isLoading ? 'Ingresando...' : 'Iniciar Sesión';
  }

  get resetButtonText(): string
  {
    return this.isLoading ? 'Enviando...' : 'Enviar Instrucciones';
  }

  onGoBack()
  {
    this.location.back();
  }
}