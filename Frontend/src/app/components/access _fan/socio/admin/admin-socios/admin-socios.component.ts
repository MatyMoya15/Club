import { Component, OnInit } from '@angular/core';
import { SocioService, Socio, UpdateSocioRequest } from 'src/app/service/socio.service';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-socios',
  templateUrl: './admin-socios.component.html',
  styleUrls: ['./admin-socios.component.css']
})
export class AdminSociosComponent implements OnInit {
  // Datos
  socios: Socio[] = [];
  sociosFiltrados: Socio[] = [];
  
  // Filtros
  filtroEstado: string = 'todos';
  busquedaSocio: string = '';
  
  // UI State
  isLoading: boolean = true;
  error: string = '';
  successMessage: string = '';

  // Modal de Edición
  showEditModal: boolean = false;
  socioEnEdicion: Socio | null = null;
  isSubmitting: boolean = false;
  
  // Formulario de Edición
  editForm = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    password: ''
  };

  // Validación
  formErrors = {
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  };

  constructor(
    private socioService: SocioService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar que sea admin
    if (!this.authService.isAdmin()) {
      console.warn('⚠️ Acceso denegado: Se requieren permisos de administrador');
      this.router.navigate(['/socio']);
      return;
    }

    this.cargarSocios();
  }

  cargarSocios(): void {
    this.isLoading = true;
    this.error = '';

    // Determinar el filtro de activo
    let activoFilter: boolean | undefined;
    if (this.filtroEstado === 'activo') {
      activoFilter = true;
    } else if (this.filtroEstado === 'inactivo') {
      activoFilter = false;
    }

    // Llamar al servicio con filtros
    this.socioService.getAllSocios(activoFilter, this.busquedaSocio).subscribe({
      next: (socios) => {
        console.log('✅ Socios cargados:', socios);
        this.socios = socios;
        this.sociosFiltrados = socios;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar socios:', error);
        this.error = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  filtrarSocios(): void {
    // Recargar desde el backend con los nuevos filtros
    this.cargarSocios();
  }

  activarSocio(socio: Socio): void {
    if (!confirm(`¿Estás seguro de activar al socio ${socio.nombre} ${socio.apellido}?`)) {
      return;
    }

    this.socioService.activateSocio(socio.id_socio).subscribe({
      next: (response) => {
        console.log('✅ Socio activado:', response);
        this.showSuccess('Socio activado exitosamente');
        this.cargarSocios(); // Recargar lista
      },
      error: (error) => {
        console.error('❌ Error al activar socio:', error);
        this.showError('Error al activar socio');
      }
    });
  }

  desactivarSocio(socio: Socio): void {
    if (!confirm(`¿Estás seguro de desactivar al socio ${socio.nombre} ${socio.apellido}?`)) {
      return;
    }

    this.socioService.deleteSocio(socio.id_socio).subscribe({
      next: (response) => {
        console.log('✅ Socio desactivado:', response);
        this.showSuccess('Socio desactivado exitosamente');
        this.cargarSocios(); // Recargar lista
      },
      error: (error) => {
        console.error('❌ Error al desactivar socio:', error);
        this.showError('Error al desactivar socio');
      }
    });
  }

  verDetalle(socio: Socio): void {
    // TODO: Implementar vista de detalle o modal
    console.log('Ver detalle de socio:', socio);
    alert(`Detalle de ${socio.nombre} ${socio.apellido}\n\nID: ${socio.id_socio}\nEmail: ${socio.email}\nDNI: ${socio.dni}`);
  }

  editarSocio(socio: Socio): void {
    console.log('Editar socio:', socio);
    this.socioEnEdicion = socio;
    
    // Cargar datos en el formulario
    this.editForm = {
      nombre: socio.nombre,
      apellido: socio.apellido,
      telefono: socio.telefono || '',
      email: socio.email,
      direccion: socio.direccion || '',
      password: '' // Siempre vacío por seguridad
    };

    // Limpiar errores
    this.formErrors = {
      nombre: '',
      apellido: '',
      email: '',
      password: ''
    };

    this.showEditModal = true;
  }

  cerrarModal(): void {
    if (this.isSubmitting) {
      return; // No cerrar si está guardando
    }
    
    this.showEditModal = false;
    this.socioEnEdicion = null;
    this.resetForm();
  }

  guardarCambios(): void {
    if (!this.socioEnEdicion || !this.validarFormulario()) {
      return;
    }

    this.isSubmitting = true;

    // Preparar datos para enviar (solo campos modificados)
    const updateData: UpdateSocioRequest = {
      nombre: this.editForm.nombre,
      apellido: this.editForm.apellido,
      email: this.editForm.email
    };

    // Agregar campos opcionales solo si tienen valor
    if (this.editForm.telefono) {
      updateData.telefono = this.editForm.telefono;
    }

    if (this.editForm.direccion) {
      updateData.direccion = this.editForm.direccion;
    }

    // Solo enviar password si se ingresó uno nuevo
    if (this.editForm.password) {
      updateData.password = this.editForm.password;
    }

    console.log('📤 Guardando cambios para socio:', this.socioEnEdicion.id_socio, updateData);

    this.socioService.updateSocio(this.socioEnEdicion.id_socio, updateData).subscribe({
      next: (response) => {
        console.log('✅ Socio actualizado:', response);
        this.isSubmitting = false;
        this.showSuccess('Socio actualizado exitosamente');
        this.cerrarModal();
        this.cargarSocios(); // Recargar lista
      },
      error: (error) => {
        console.error('❌ Error al actualizar socio:', error);
        this.isSubmitting = false;
        this.showError(this.getErrorMessage(error));
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
      password: ''
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

    // Validar password (solo si se ingresó uno)
    if (this.editForm.password && this.editForm.password.length < 6) {
      this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
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
      password: ''
    };
    this.formErrors = {
      nombre: '',
      apellido: '',
      email: '',
      password: ''
    };
    this.isSubmitting = false;
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'todos';
    this.busquedaSocio = '';
    this.cargarSocios();
  }

  exportarSocios(): void {
    // TODO: Implementar exportación a CSV/Excel
    console.log('Exportar socios');
    alert('Función de exportar - Por implementar');
  }

  // Helpers
  private getErrorMessage(error: any): string {
    if (error.status === 403) {
      return 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      return 'Socio no encontrado';
    } else if (error.status === 400) {
      return error.error?.error || 'Datos inválidos';
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

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Getters para el template
  get totalSocios(): number {
    return this.sociosFiltrados.length;
  }

  get sociosActivos(): number {
    return this.sociosFiltrados.filter(s => s.activo).length;
  }

  get sociosInactivos(): number {
    return this.sociosFiltrados.filter(s => !s.activo).length;
  }
}