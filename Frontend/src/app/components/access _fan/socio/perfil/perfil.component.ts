import { Component, OnInit } from '@angular/core';
import { AuthService, User } from 'src/app/service/auth.service';
import { SocioService, UpdateSocioRequest } from 'src/app/service/socio.service';
import { Router, ActivatedRoute } from '@angular/router';

interface SocioData {
  nombreCompleto: string;
  numeroSocio: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaAfiliacion: string;
  estaActivo: boolean;
  rol: string;
  // Para futuras integraciones con cuotas
  debeCuotas: boolean;
  montoPendiente: number;
}

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  currentUser: User | null = null;
  socioData!: SocioData;
  isLoading: boolean = true;
  error: string = '';
  successMessage: string = '';

  // Modal de Edición
  showEditModal: boolean = false;
  isSubmitting: boolean = false;

  // Formulario de Edición
  editForm = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: ''
  };

  // Validación
  formErrors = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: ''
  };

constructor(
  private authService: AuthService,
  private socioService: SocioService,
  private router: Router,
  private route: ActivatedRoute
  ) {}

ngOnInit(): void {
  this.loadUserData();
  
  // ✅ Detectar si viene del primer login
  this.route.queryParams.subscribe(params => {
    if (params['cambiarPassword'] === 'true') {
      setTimeout(() => {
        this.showWarning('⚠️ Por seguridad, debés cambiar tu contraseña predeterminada');
        this.editarPerfil(); // Abrir automáticamente el modal
      }, 500);
    }
  });
}

// ✅ Agregar método para mostrar warning
private showWarning(message: string): void {
  this.error = message; // Usa el mismo sistema de alertas que ya tienes
  setTimeout(() => {
    this.error = '';
  }, 8000); // Mostrar por más tiempo
}

  private loadUserData(): void {
    this.isLoading = true;

    // Obtener usuario actual del servicio
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.mapUserToSocioData(user);
          this.isLoading = false;
        } else {
          this.error = 'No se encontró información del usuario';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.error = 'Error al cargar los datos del usuario';
        this.isLoading = false;
      }
    });

    // Opcionalmente, refrescar datos desde el backend
    this.refreshUserData();
  }

  private mapUserToSocioData(user: User): void {
    this.socioData = {
      nombreCompleto: `${user.nombre} ${user.apellido}`,
      numeroSocio: user.numero_socio,
      dni: user.dni,
      email: user.email || 'No registrado',
      telefono: user.telefono || 'No registrado',
      direccion: user.direccion || 'No registrada',
      fechaAfiliacion: this.formatFecha(user.fecha_alta),
      estaActivo: user.activo,
      rol: user.rol,
      // TODO: Implementar cuando tengas el servicio de cuotas
      debeCuotas: false,
      montoPendiente: 0
    };
  }

  refreshUserData(): void {
    // Llamar al endpoint /api/auth/me para obtener datos actualizados
    this.authService.getMe().subscribe({
      next: (user) => {
        console.log('✅ Datos actualizados del usuario:', user);
        
        // Actualizar localStorage con los datos más recientes
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Actualizar los datos mostrados
        this.currentUser = user;
        this.mapUserToSocioData(user);
      },
      error: (error) => {
        console.error('❌ Error al actualizar datos:', error);
        if (error.status === 401) {
          // Token inválido, el interceptor manejará el logout
          this.authService.logout();
        }
      }
    });
  }

  editarPerfil(): void {
    if (!this.currentUser) return;

    console.log('Editar perfil');
    
    // Cargar datos en el formulario
    this.editForm = {
      nombre: this.currentUser.nombre,
      apellido: this.currentUser.apellido,
      telefono: this.currentUser.telefono || '',
      email: this.currentUser.email || '',
      direccion: this.currentUser.direccion || '',
      passwordActual: '',
      passwordNueva: '',
      passwordConfirmar: ''
    };

    // Limpiar errores
    this.formErrors = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      passwordActual: '',
      passwordNueva: '',
      passwordConfirmar: ''
    };

    this.showEditModal = true;
  }

  cerrarModal(): void {
    if (this.isSubmitting) {
      return; // No cerrar si está guardando
    }
    
    this.showEditModal = false;
    this.resetForm();
  }

guardarCambios(): void {
  if (!this.currentUser || !this.validarFormulario()) {
    return;
  }

  this.isSubmitting = true;

  // ✅ Si está cambiando contraseña, usar endpoint específico
  if (this.editForm.passwordNueva && this.editForm.passwordNueva.trim()) {
    this.cambiarPassword();
    return;
  }

  // Preparar datos para enviar (solo info del perfil, sin password)
  const updateData: UpdateSocioRequest = {
    nombre: this.editForm.nombre.trim(),
    apellido: this.editForm.apellido.trim()
  };

  // Agregar email solo si tiene valor
  if (this.editForm.email && this.editForm.email.trim()) {
    updateData.email = this.editForm.email.trim();
  }

  // Agregar campos opcionales solo si tienen valor
  if (this.editForm.telefono.trim()) {
    updateData.telefono = this.editForm.telefono.trim();
  }

  if (this.editForm.direccion.trim()) {
    updateData.direccion = this.editForm.direccion.trim();
  }

  console.log('📤 Guardando cambios del perfil:', updateData);

  this.socioService.updateMiPerfil(updateData).subscribe({
    next: (response) => {
      console.log('✅ Perfil actualizado:', response);
      this.isSubmitting = false;
      this.showSuccess('Perfil actualizado exitosamente');
      this.cerrarModal();
      
      this.currentUser = response.socio;
      localStorage.setItem('currentUser', JSON.stringify(response.socio));
      this.mapUserToSocioData(response.socio);
    },
    error: (error) => {
      console.error('❌ Error al actualizar perfil:', error);
      this.isSubmitting = false;
      this.showError(this.getErrorMessage(error));
    }
  });
}

private cambiarPassword(): void {
  // La contraseña actual debería ser la que tiene actualmente
  // Si es primer login, será "club2025"
  const currentPassword = this.editForm.passwordActual || 'club2025';
  
  this.authService.changePassword(
    currentPassword,
    this.editForm.passwordNueva
  ).subscribe({
    next: (response) => {
      console.log('✅ Contraseña cambiada:', response);
      
      // Ahora actualizar el resto del perfil
      const updateData: UpdateSocioRequest = {
        nombre: this.editForm.nombre.trim(),
        apellido: this.editForm.apellido.trim()
      };

      if (this.editForm.email && this.editForm.email.trim()) {
        updateData.email = this.editForm.email.trim();
      }

      if (this.editForm.telefono.trim()) {
        updateData.telefono = this.editForm.telefono.trim();
      }

      if (this.editForm.direccion.trim()) {
        updateData.direccion = this.editForm.direccion.trim();
      }

      // Actualizar el resto del perfil
      this.socioService.updateMiPerfil(updateData).subscribe({
        next: (profileResponse) => {
          this.isSubmitting = false;
          this.showSuccess('Perfil y contraseña actualizados exitosamente');
          this.cerrarModal();
          
          this.currentUser = profileResponse.socio;
          localStorage.setItem('currentUser', JSON.stringify(profileResponse.socio));
          this.mapUserToSocioData(profileResponse.socio);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.showError('Contraseña actualizada pero hubo un error al actualizar el perfil');
        }
      });
    },
    error: (error) => {
      console.error('❌ Error al cambiar contraseña:', error);
      this.isSubmitting = false;
      
      if (error.status === 401) {
        this.formErrors.passwordActual = 'Contraseña actual incorrecta';
        this.showError('Contraseña actual incorrecta');
      } else {
        this.showError(this.getErrorMessage(error));
      }
    }
  });
}

validarFormulario(): boolean {
  let isValid = true;

  // Limpiar errores previos
  this.formErrors = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    passwordActual: '',
    passwordNueva: '',
    passwordConfirmar: ''
  };

    // Validar nombre
    if (!this.editForm.nombre || this.editForm.nombre.trim().length === 0) {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    } else if (this.editForm.nombre.trim().length < 2) {
      this.formErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar apellido
    if (!this.editForm.apellido || this.editForm.apellido.trim().length === 0) {
      this.formErrors.apellido = 'El apellido es requerido';
      isValid = false;
    } else if (this.editForm.apellido.trim().length < 2) {
      this.formErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.editForm.email || this.editForm.email.trim().length === 0) {
      this.formErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!emailRegex.test(this.editForm.email)) {
      this.formErrors.email = 'El email no es válido';
      isValid = false;
    }

    // Validar contraseñas (solo si se intenta cambiar)
  const intentaCambiarPassword = this.editForm.passwordNueva || this.editForm.passwordConfirmar;

  if (intentaCambiarPassword) {
    // ✅ Validar contraseña actual (pero no si es primer login)
    const esPrimerLogin = this.currentUser?.primer_login;
    
    if (!esPrimerLogin && (!this.editForm.passwordActual || this.editForm.passwordActual.length === 0)) {
      this.formErrors.passwordActual = 'Debés ingresar tu contraseña actual';
      isValid = false;
    }

    // Validar que la nueva contraseña tenga al menos 6 caracteres
    if (!this.editForm.passwordNueva || this.editForm.passwordNueva.length < 6) {
      this.formErrors.passwordNueva = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    // Validar que las contraseñas coincidan
    if (this.editForm.passwordNueva !== this.editForm.passwordConfirmar) {
      this.formErrors.passwordConfirmar = 'Las contraseñas no coinciden';
      isValid = false;
    }
  }

  return isValid;
}

  resetForm(): void {
    this.editForm = {
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      direccion: '',
      passwordActual: '',
      passwordNueva: '',
      passwordConfirmar: ''
    };
    this.formErrors = {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      passwordActual: '',
      passwordNueva: '',
      passwordConfirmar: ''
    };
    this.isSubmitting = false;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      return 'Usuario no encontrado';
    } else if (error.status === 400) {
      return error.error?.error || 'Datos inválidos';
    } else if (error.status === 401) {
      return 'Credenciales incorrectas';
    } else if (error.status === 0) {
      return 'No se pudo conectar con el servidor';
    } else if (error.error?.error) {
      return error.error.error;
    }
    return 'Error al procesar la solicitud';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private showError(message: string): void {
    this.error = message;
    setTimeout(() => {
      this.error = '';
    }, 3000);
  }

  // Helpers
  getIniciales(): string {
    if (!this.currentUser) return 'U';
    
    const inicial1 = this.currentUser.nombre?.charAt(0).toUpperCase() || '';
    const inicial2 = this.currentUser.apellido?.charAt(0).toUpperCase() || '';
    
    return `${inicial1}${inicial2}`;
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return 'No disponible';
    
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  }

  // Getters útiles para el template
  get fullName(): string {
    return this.socioData?.nombreCompleto || '';
  }

  get memberSince(): string {
    return this.socioData?.fechaAfiliacion || '';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    if (confirm('¿Estás seguro que querés cerrar sesión?')) {
      this.authService.logout();
    }
  }
}