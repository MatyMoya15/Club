import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeporteService, Deporte, Clase, Instructor } from './../../../../../service/deportes.service';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-cuotas',
  templateUrl: './admin-cuotas.component.html',
  styleUrls: ['./admin-cuotas.component.css']
})
export class AdminCuotasComponent implements OnInit {
  // Pestañas
  tabActiva: 'deportes' | 'clases' | 'instructores' = 'deportes';

  // Datos
  deportes: Deporte[] = [];
  clases: Clase[] = [];
  instructores: Instructor[] = [];

  // Estados
  cargando = false;
  error = '';

  // Modal
  modalInstance: any;
  accionModal: 'crear' | 'ver' | 'editar' | 'eliminar' = 'crear';
  tipoModal: 'deporte' | 'clase' | 'instructor' = 'deporte';

  // Items seleccionados
  deporteSeleccionado: Deporte | null = null;
  claseSeleccionada: Clase | null = null;
  instructorSeleccionado: Instructor | null = null;

  // Formularios
  deporteForm!: FormGroup;
  claseForm!: FormGroup;
  instructorForm!: FormGroup;

  // Filtros
  filtroDeporte = '';
  filtroClase = '';
  filtroInstructor = '';

  // Días de la semana
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(
    private deporteService: DeporteService,
    private fb: FormBuilder
  ) {
    this.inicializarFormularios();
  }

  ngOnInit(): void {
    this.cargarTodo();
  }

  inicializarFormularios(): void {
    // Formulario de Deporte
    this.deporteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      monto_mensual: [0, [Validators.required, Validators.min(0)]]
    });

    // Formulario de Clase
    this.claseForm = this.fb.group({
      id_deporte: ['', Validators.required],
      id_instructor: [''],
      dia: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required],
      cancha: [''],
      activa: [true]
    });

    // Formulario de Instructor
    this.instructorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      categoria: [''],
      activo: [true]
    });
  }

  // ==================== CARGA DE DATOS ====================

  cargarTodo(): void {
    this.cargarDeportes();
    this.cargarClases();
    this.cargarInstructores();
  }

  cargarDeportes(): void {
    this.cargando = true;
    this.deporteService.getAllDeportes().subscribe({
      next: (data) => {
        this.deportes = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar deportes';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarClases(): void {
    this.deporteService.getAllClases().subscribe({
      next: (data) => {
        this.clases = data;
      },
      error: (err) => {
        console.error('Error al cargar clases:', err);
      }
    });
  }

  cargarInstructores(): void {
    this.deporteService.getAllInstructores().subscribe({
      next: (data) => {
        this.instructores = data;
      },
      error: (err) => {
        console.error('Error al cargar instructores:', err);
      }
    });
  }

  // ==================== DEPORTES ====================

  get deportesFiltrados(): Deporte[] {
    if (!this.filtroDeporte) return this.deportes;
    return this.deportes.filter(d =>
      d.nombre.toLowerCase().includes(this.filtroDeporte.toLowerCase())
    );
  }

  abrirModalDeporte(accion: 'crear' | 'ver' | 'editar', deporte?: Deporte): void {
    this.accionModal = accion;
    this.tipoModal = 'deporte';
    this.deporteSeleccionado = deporte || null;

    if (accion === 'crear') {
      this.deporteForm.reset({ monto_mensual: 0 });
    } else if (deporte && accion !== 'ver') {
      this.deporteForm.patchValue(deporte);
    }

    this.abrirModal();
  }

  confirmarEliminarDeporte(deporte: Deporte): void {
    this.accionModal = 'eliminar';
    this.tipoModal = 'deporte';
    this.deporteSeleccionado = deporte;
    this.abrirModal();
  }

  guardarDeporte(): void {
    if (this.deporteForm.invalid) return;

    const data = this.deporteForm.value;

    if (this.accionModal === 'crear') {
      this.deporteService.createDeporte(data).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarDeportes();
          this.mostrarMensaje('Deporte creado exitosamente');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensaje('Error al crear el deporte', 'error');
        }
      });
    } else if (this.accionModal === 'editar' && this.deporteSeleccionado) {
      this.deporteService.updateDeporte(this.deporteSeleccionado.id_deportes, data).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarDeportes();
          this.mostrarMensaje('Deporte actualizado exitosamente');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensaje('Error al actualizar el deporte', 'error');
        }
      });
    }
  }

  eliminarDeporte(): void {
    if (!this.deporteSeleccionado) return;

    this.deporteService.deleteDeporte(this.deporteSeleccionado.id_deportes).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarDeportes();
        this.cargarClases();
        this.mostrarMensaje('Deporte eliminado exitosamente');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al eliminar el deporte', 'error');
      }
    });
  }

  // ==================== CLASES ====================

  get clasesFiltradas(): Clase[] {
    if (!this.filtroClase) return this.clases;
    return this.clases.filter(c =>
      c.deporte_nombre?.toLowerCase().includes(this.filtroClase.toLowerCase()) ||
      c.dia.toLowerCase().includes(this.filtroClase.toLowerCase())
    );
  }

  abrirModalClase(accion: 'crear' | 'ver' | 'editar', clase?: Clase): void {
    this.accionModal = accion;
    this.tipoModal = 'clase';
    this.claseSeleccionada = clase || null;

    if (accion === 'crear') {
      this.claseForm.reset({ activa: true });
    } else if (clase && accion !== 'ver') {
      this.claseForm.patchValue({
        id_deporte: clase.id_deporte,
        id_instructor: clase.id_instructor,
        dia: clase.dia,
        hora_inicio: clase.hora_inicio.substring(0, 5),
        hora_fin: clase.hora_fin.substring(0, 5),
        cancha: clase.cancha,
        activa: clase.activa
      });
    }

    this.abrirModal();
  }

  confirmarEliminarClase(clase: Clase): void {
    this.accionModal = 'eliminar';
    this.tipoModal = 'clase';
    this.claseSeleccionada = clase;
    this.abrirModal();
  }

  guardarClase(): void {
    if (this.claseForm.invalid) return;

    const data = this.claseForm.value;

    if (this.accionModal === 'crear') {
      this.deporteService.createClase(data).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarClases();
          this.mostrarMensaje('Clase creada exitosamente');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensaje('Error al crear la clase', 'error');
        }
      });
    } else if (this.accionModal === 'editar' && this.claseSeleccionada) {
      this.deporteService.updateClase(this.claseSeleccionada.id_clase, data).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarClases();
          this.mostrarMensaje('Clase actualizada exitosamente');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensaje('Error al actualizar la clase', 'error');
        }
      });
    }
  }

  eliminarClase(): void {
    if (!this.claseSeleccionada) return;

    this.deporteService.deleteClase(this.claseSeleccionada.id_clase).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarClases();
        this.mostrarMensaje('Clase eliminada exitosamente');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al eliminar la clase', 'error');
      }
    });
  }

  toggleEstadoClase(clase: Clase): void {
    this.deporteService.toggleClase(clase.id_clase).subscribe({
      next: () => {
        this.cargarClases();
        this.mostrarMensaje(`Clase ${clase.activa ? 'desactivada' : 'activada'}`);
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al cambiar estado de la clase', 'error');
      }
    });
  }

  // ==================== INSTRUCTORES ====================

  get instructoresFiltrados(): Instructor[] {
    if (!this.filtroInstructor) return this.instructores;
    return this.instructores.filter(i =>
      i.nombre.toLowerCase().includes(this.filtroInstructor.toLowerCase()) ||
      i.apellido.toLowerCase().includes(this.filtroInstructor.toLowerCase())
    );
  }

  abrirModalInstructor(accion: 'crear' | 'ver' | 'editar', instructor?: Instructor): void {
    this.accionModal = accion;
    this.tipoModal = 'instructor';
    this.instructorSeleccionado = instructor || null;

    if (accion === 'crear') {
      this.instructorForm.reset({ activo: true });
    } else if (instructor && accion !== 'ver') {
      this.instructorForm.patchValue(instructor);
    }

    this.abrirModal();
  }

  confirmarEliminarInstructor(instructor: Instructor): void {
    this.accionModal = 'eliminar';
    this.tipoModal = 'instructor';
    this.instructorSeleccionado = instructor;
    this.abrirModal();
  }

  guardarInstructor(): void {
    if (this.instructorForm.invalid) return;

    const data = this.instructorForm.value;

    if (this.accionModal === 'crear') {
      this.deporteService.createInstructor(data).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarInstructores();
          this.mostrarMensaje('Instructor creado exitosamente');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensaje('Error al crear el instructor', 'error');
        }
      });
    } else if (this.accionModal === 'editar' && this.instructorSeleccionado) {
      this.deporteService.updateInstructor(this.instructorSeleccionado.id_instructores, data).subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarInstructores();
          this.cargarClases();
          this.mostrarMensaje('Instructor actualizado exitosamente');
        },
        error: (err) => {
          console.error(err);
          this.mostrarMensaje('Error al actualizar el instructor', 'error');
        }
      });
    }
  }

  eliminarInstructor(): void {
    if (!this.instructorSeleccionado) return;

    this.deporteService.deleteInstructor(this.instructorSeleccionado.id_instructores).subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarInstructores();
        this.cargarClases();
        this.mostrarMensaje('Instructor desactivado exitosamente');
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al desactivar el instructor', 'error');
      }
    });
  }

  toggleEstadoInstructor(instructor: Instructor): void {
    const endpoint = instructor.activo ? 'deleteInstructor' : 'activateInstructor';
    
    this.deporteService[endpoint](instructor.id_instructores).subscribe({
      next: () => {
        this.cargarInstructores();
        this.mostrarMensaje(`Instructor ${instructor.activo ? 'desactivado' : 'activado'}`);
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('Error al cambiar estado del instructor', 'error');
      }
    });
  }

  // ==================== MODAL ====================

  abrirModal(): void {
    const modalEl = document.getElementById('crudModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    }
  }

  cerrarModal(): void {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
    this.deporteSeleccionado = null;
    this.claseSeleccionada = null;
    this.instructorSeleccionado = null;
  }

  // ==================== UTILIDADES ====================

  getDeporteNombre(idDeporte: number): string {
    const deporte = this.deportes.find(d => d.id_deportes === idDeporte);
    return deporte?.nombre || 'N/A';
  }

  getInstructorNombre(idInstructor?: number): string {
    if (!idInstructor) return 'Sin asignar';
    const instructor = this.instructores.find(i => i.id_instructores === idInstructor);
    return instructor ? `${instructor.nombre} ${instructor.apellido}` : 'N/A';
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success'): void {
    alert(mensaje);
  }

  cambiarTab(tab: 'deportes' | 'clases' | 'instructores'): void {
    this.tabActiva = tab;
  }
}