import { Component, OnInit } from '@angular/core';
import { SocioService, Socio, UpdateSocioRequest } from 'src/app/service/socio.service';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { CuotaService, Cuota, PagarCuotaRequest } from 'src/app/service/cuota.service';

@Component({
  selector: 'app-admin-socios',
  templateUrl: './admin-socios.component.html',
  styleUrls: ['./admin-socios.component.css']
})
export class AdminSociosComponent implements OnInit
{
  socios: Socio[] = [];
  sociosFiltrados: Socio[] = [];

  filtroEstado: string = 'todos';
  busquedaSocio: string = '';

  isLoading: boolean = true;
  error: string = '';
  successMessage: string = '';

  showEditModal: boolean = false;
  socioEnEdicion: Socio | null = null;
  isSubmitting: boolean = false;
  isViewMode: boolean = false;
  editForm = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    direccion: '',
    password: ''
  };

  formErrors = {
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  };

showCuotasModal: boolean = false;
socioVerCuotas: Socio | null = null;
cuotas: Cuota[] = [];
isLoadingCuotas: boolean = false;
errorCuotas: string = '';

showPagoModal: boolean = false;
cuotaAPagar: Cuota | null = null;
isSubmittingPago: boolean = false;
pagoForm = {
  metodo: 'efectivo' as 'efectivo' | 'transferencia' | 'tarjeta' | 'mercadopago',
  monto: 8000,
  comprobante: ''
};
hoy: Date = new Date();


constructor(
  private socioService: SocioService,
  private authService: AuthService,
  private cuotaService: CuotaService,  
  private router: Router
  ) { }

  ngOnInit(): void
  {
    if (!this.authService.isAdmin())
    {
      console.warn(' Acceso denegado: Se requieren permisos de administrador');
      this.router.navigate(['/socio']);
      return;
    }

    this.cargarSocios();
  }

  cargarSocios(): void
  {
    this.isLoading = true;
    this.error = '';

    let activoFilter: boolean | undefined;
    if (this.filtroEstado === 'activo')
    {
      activoFilter = true;
    } else if (this.filtroEstado === 'inactivo')
    {
      activoFilter = false;
    }

    this.socioService.getAllSocios(activoFilter, this.busquedaSocio).subscribe({
      next: (socios) =>
      {
        this.socios = socios.sort((a, b) => Number(a.numero_socio) - Number(b.numero_socio)); this.sociosFiltrados = this.socios;
        this.isLoading = false;
      },
      error: (error) =>
      {
        console.error('❌ Error al cargar socios:', error);
        this.error = this.getErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  filtrarSocios(): void
  {
    this.cargarSocios();
  }

  activarSocio(socio: Socio): void
  {
    if (!confirm(`¿Estás seguro de activar al socio ${socio.nombre} ${socio.apellido}?`))
    {
      return;
    }

    this.socioService.activateSocio(socio.id_socio).subscribe({
      next: (response) =>
      {
        this.showSuccess('Socio activado exitosamente');
        this.cargarSocios();
      },
      error: (error) =>
      {
        console.error('❌ Error al activar socio:', error);
        this.showError('Error al activar socio');
      }
    });
  }

  desactivarSocio(socio: Socio): void
  {
    if (!confirm(`¿Estás seguro de desactivar al socio ${socio.nombre} ${socio.apellido}?`))
    {
      return;
    }

    this.socioService.deleteSocio(socio.id_socio).subscribe({
      next: (response) =>
      {
        this.showSuccess('Socio desactivado exitosamente');
        this.cargarSocios();
      },
      error: (error) =>
      {
        console.error('❌ Error al desactivar socio:', error);
        this.showError('Error al desactivar socio');
      }
    });
  }

verDetalle(socio: Socio): void {
  this.isViewMode = true;
  this.editarSocio(socio);
  console.log(socio, 'Hola')
}

editarSocio(socio: Socio): void {
  this.socioEnEdicion = socio;
  this.editForm = {
    nombre: socio.nombre,
    apellido: socio.apellido,
    telefono: socio.telefono || '',
    email: socio.email,
    direccion: socio.direccion || '',
    password: ''
  };
  this.formErrors = { nombre: '', apellido: '', email: '', password: '' };
  this.showEditModal = true;
}

  cerrarModal(): void
  {
    if (this.isSubmitting) return;
    this.showEditModal = false;
    this.socioEnEdicion = null;
    this.isViewMode = false;
    this.resetForm();
  }
  guardarCambios(): void
  {
    if (!this.socioEnEdicion || !this.validarFormulario())
    {
      return;
    }

    this.isSubmitting = true;

    const updateData: UpdateSocioRequest = {
      nombre: this.editForm.nombre,
      apellido: this.editForm.apellido,
      email: this.editForm.email
    };

    if (this.editForm.telefono)
    {
      updateData.telefono = this.editForm.telefono;
    }

    if (this.editForm.direccion)
    {
      updateData.direccion = this.editForm.direccion;
    }

    if (this.editForm.password)
    {
      updateData.password = this.editForm.password;
    }

    this.socioService.updateSocio(this.socioEnEdicion.id_socio, updateData).subscribe({
      next: (response) =>
      {
        this.isSubmitting = false;
        this.showSuccess('Socio actualizado exitosamente');
        this.cerrarModal();
        this.cargarSocios();
      },
      error: (error) =>
      {
        console.error('❌ Error al actualizar socio:', error);
        this.isSubmitting = false;
        this.showError(this.getErrorMessage(error));
      }
    });
  }

  validarFormulario(): boolean
  {
    let isValid = true;

    this.formErrors = {
      nombre: '',
      apellido: '',
      email: '',
      password: ''
    };

    // Validar nombre
    if (!this.editForm.nombre || this.editForm.nombre.trim().length === 0)
    {
      this.formErrors.nombre = 'El nombre es requerido';
      isValid = false;
    } else if (this.editForm.nombre.trim().length < 2)
    {
      this.formErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar apellido
    if (!this.editForm.apellido || this.editForm.apellido.trim().length === 0)
    {
      this.formErrors.apellido = 'El apellido es requerido';
      isValid = false;
    } else if (this.editForm.apellido.trim().length < 2)
    {
      this.formErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
      isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.editForm.email || this.editForm.email.trim().length === 0)
    {
      this.formErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!emailRegex.test(this.editForm.email))
    {
      this.formErrors.email = 'El email no es válido';
      isValid = false;
    }

    // Validar password (solo si se ingresó uno)
    if (this.editForm.password && this.editForm.password.length < 6)
    {
      this.formErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    return isValid;
  }

  resetForm(): void
  {
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

  limpiarFiltros(): void
  {
    this.filtroEstado = 'todos';
    this.busquedaSocio = '';
    this.cargarSocios();
  }

  exportarSocios(): void
  {
    alert('Función de exportar - Por implementar');
  }

  // Helpers
  private getErrorMessage(error: any): string
  {
    if (error.status === 403)
    {
      return 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404)
    {
      return 'Socio no encontrado';
    } else if (error.status === 400)
    {
      return error.error?.error || 'Datos inválidos';
    } else if (error.status === 0)
    {
      return 'No se pudo conectar con el servidor';
    } else if (error.error?.error)
    {
      return error.error.error;
    }
    return 'Error al procesar la solicitud';
  }

  private showSuccess(message: string): void
  {
    this.successMessage = message;
    setTimeout(() =>
    {
      this.successMessage = '';
    }, 3000);
  }

  private showError(message: string): void
  {
    this.error = message;
    setTimeout(() =>
    {
      this.error = '';
    }, 3000);
  }

  formatearFecha(fecha: string): string
  {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Getters para el template
  get totalSocios(): number
  {
    return this.sociosFiltrados.length;
  }

  get sociosActivos(): number
  {
    return this.sociosFiltrados.filter(s => s.activo).length;
  }

  get sociosInactivos(): number
  {
    return this.sociosFiltrados.filter(s => !s.activo).length;
  }

  verCuotas(socio: Socio): void {
  this.socioVerCuotas = socio;
  this.showCuotasModal = true;
  this.cuotas = [];
  this.isLoadingCuotas = true;
  this.errorCuotas = '';

  this.cuotaService.getCuotasBySocio(socio.id_socio).subscribe({
    next: (cuotas) => {
      this.cuotas = cuotas.sort((a, b) => {
        if (a.anio !== b.anio) return a.anio - b.anio;
        return a.mes - b.mes;
      });
      this.isLoadingCuotas = false;
    },
    error: (error) => {
      this.errorCuotas = 'Error al cargar las cuotas';
      this.isLoadingCuotas = false;
    }
  });
}

cerrarCuotasModal(): void {
  this.showCuotasModal = false;
  this.socioVerCuotas = null;
  this.cuotas = [];
}

abrirPagoModal(cuota: Cuota): void {
  this.cuotaAPagar = cuota;
  const totalPagado = Number((cuota as any).total_pagado || 0);
  const restante = Number(cuota.monto) - totalPagado;
  
  this.pagoForm = {
    metodo: 'efectivo',
    monto: restante,
    comprobante: ''
  };
  this.showPagoModal = true;
}

cerrarPagoModal(): void {
  if (this.isSubmittingPago) return;
  this.showPagoModal = false;
  this.cuotaAPagar = null;
}

confirmarPago(): void {
  if (!this.cuotaAPagar) return;
  this.isSubmittingPago = true;

  const data: PagarCuotaRequest = {
    metodo: this.pagoForm.metodo,
    monto: this.pagoForm.monto,
    comprobante: this.pagoForm.comprobante || undefined
  };

  this.cuotaService.pagarCuota(this.cuotaAPagar.id_cuota, data).subscribe({
    next: () => {
      this.isSubmittingPago = false;
      this.showSuccess('Cuota marcada como pagada');
      this.cerrarPagoModal();
      if (this.socioVerCuotas) this.verCuotas(this.socioVerCuotas);
    },
    error: (error) => {
      this.isSubmittingPago = false;
      this.showError('Error al registrar el pago');
    }
  });
}

getNombreMes(mes: number): string {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  return meses[mes - 1];
}

getEstadoBadgeClass(estado: string): string {
  switch (estado) {
    case 'pagada':  return 'bg-success';
    case 'vencida': return 'bg-danger';
    default:        return 'bg-warning text-dark';
  }
}


get cuotasPendientes(): number { return this.cuotas.filter(c => c.estado === 'pendiente').length; }
get cuotasPagadas(): number    { return this.cuotas.filter(c => c.estado === 'pagada').length; }
get cuotasVencidas(): number   { return this.cuotas.filter(c => c.estado === 'vencida').length; }
}