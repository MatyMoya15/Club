import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeporteService, Deporte, Clase, Instructor } from '../../../../../service/deportes.service';
import { forkJoin } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-deportes',
  templateUrl: './admin-deportes.component.html',
  styleUrls: ['./admin-deportes.component.css']
})
export class AdminDeportesComponent implements OnInit
{
  tabActiva: 'deportes' | 'clases' | 'instructores' = 'deportes';

  deportes: Deporte[] = [];
  clases: Clase[] = [];
  instructores: Instructor[] = [];

  cargando = false;
  error = '';

  modalInstance: any;
  accionModal: 'crear' | 'ver' | 'editar' | 'eliminar' = 'crear';
  tipoModal: 'deporte' | 'clase' | 'instructor' = 'deporte';

  deporteSeleccionado: Deporte | null = null;
  claseSeleccionada: Clase | null = null;
  instructorSeleccionado: Instructor | null = null;

  deporteForm!: FormGroup;
  claseForm!: FormGroup;
  instructorForm!: FormGroup;

  filtroDeporte = '';
  filtroClase = '';
  filtroInstructor = '';

  clasesFiltradas: any[] = [];


  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(
    private deporteService: DeporteService,
    private fb: FormBuilder
  )
  {
    this.inicializarFormularios();
  }

  ngOnInit(): void
  {
    this.cargarTodo();
    this.agregarHorario();
  }

  inicializarFormularios(): void
  {
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
      horarios: this.fb.array([], Validators.required),
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

  cargarTodo(): void
  {
    this.cargarDeportes();
    this.cargarClases();
    this.cargarInstructores();
  }

  cargarDeportes(): void
  {
    this.cargando = true;
    this.deporteService.getAllDeportes().subscribe({
      next: (data) =>
      {
        this.deportes = data;
        this.cargando = false;
      },
      error: (err) =>
      {
        this.error = 'Error al cargar deportes';
        this.cargando = false;
        console.error(err);
      }
    });
  }

  cargarClases(): void
  {
    this.deporteService.getAllClases().subscribe({
      next: (data) =>
      {
        this.clases = data;
        this.aplicarFiltroClases(); // ← recalcular al cargar
      },
      error: (err) => console.error('Error al cargar clases:', err)
    });
  }

  cargarInstructores(): void
  {
    this.deporteService.getAllInstructores(true).subscribe({
      next: (data) =>
      {
        this.instructores = data;
      },
      error: (err) =>
      {
        console.error('Error al cargar instructores:', err);
      }
    });
  }

  // ==================== DEPORTES ====================

  get deportesFiltrados(): Deporte[]
  {
    if (!this.filtroDeporte) return this.deportes;
    return this.deportes.filter(d =>
      d.nombre.toLowerCase().includes(this.filtroDeporte.toLowerCase())
    );
  }

  abrirModalDeporte(accion: 'crear' | 'ver' | 'editar', deporte?: Deporte): void
  {
    this.accionModal = accion;
    this.tipoModal = 'deporte';
    this.deporteSeleccionado = deporte || null;

    if (accion === 'crear')
    {
      this.deporteForm.reset({ monto_mensual: 0 });
    } else if (deporte && accion !== 'ver')
    {
      this.deporteForm.patchValue(deporte);
    }

    this.abrirModal();
  }

  confirmarEliminarDeporte(deporte: Deporte): void
  {
    this.accionModal = 'eliminar';
    this.tipoModal = 'deporte';
    this.deporteSeleccionado = deporte;
    this.abrirModal();
  }

  guardarDeporte(): void
  {
    if (this.deporteForm.invalid) return;

    const data = this.deporteForm.value;

    if (this.accionModal === 'crear')
    {
      this.deporteService.createDeporte(data).subscribe({
        next: () =>
        {
          this.cerrarModal();
          this.cargarDeportes();
          this.mostrarMensaje('Deporte creado exitosamente');
        },
        error: (err) =>
        {
          console.error(err);
          this.mostrarMensaje('Error al crear el deporte', 'error');
        }
      });
    } else if (this.accionModal === 'editar' && this.deporteSeleccionado)
    {
      this.deporteService.updateDeporte(this.deporteSeleccionado.id_deportes, data).subscribe({
        next: () =>
        {
          this.cerrarModal();
          this.cargarDeportes();
          this.mostrarMensaje('Deporte actualizado exitosamente');
        },
        error: (err) =>
        {
          console.error(err);
          this.mostrarMensaje('Error al actualizar el deporte', 'error');
        }
      });
    }
  }

  eliminarDeporte(): void
  {
    if (!this.deporteSeleccionado) return;

    this.deporteService.deleteDeporte(this.deporteSeleccionado.id_deportes).subscribe({
      next: () =>
      {
        this.cerrarModal();
        this.cargarDeportes();
        this.cargarClases();
        this.mostrarMensaje('Deporte eliminado exitosamente');
      },
      error: (err) =>
      {
        console.error(err);
        if (err.status === 400)
        {
          this.mostrarMensaje(
            err.error?.error || 'No se puede eliminar el deporte porque tiene clases asociadas. Eliminá las clases primero.',
            'error'
          );
        } else
        {
          this.mostrarMensaje('Error al eliminar el deporte', 'error');
        }
        this.cerrarModal();
      }
    });
  }

  // ==================== CLASES ====================
  abrirModalClase(accion: 'crear' | 'ver' | 'editar', clase?: any): void
  {
    this.accionModal = accion;
    this.tipoModal = 'clase';
    this.claseSeleccionada = clase || null;

    this.horarios.clear();

    if (accion === 'crear')
    {
      this.claseForm.reset({ activa: true });
      this.agregarHorario();

    } else if (clase && accion !== 'ver')
    {
      this.claseForm.patchValue({
        id_deporte: clase.id_deporte,
        id_instructor: clase.id_instructor,
        cancha: clase.cancha,
        activa: clase.activa
      });

      // Cargar todos los horarios del grupo
      clase.horarios.forEach((h: any) =>
      {
        this.horarios.push(
          this.fb.group({
            dia: [h.dia, Validators.required],
            hora_inicio: [h.hora_inicio.substring(0, 5), Validators.required],
            hora_fin: [h.hora_fin.substring(0, 5), Validators.required],
            id_clase: [h.id_clase]  // guardar id para saber cuáles actualizar y cuáles crear
          })
        );
      });
    }

    this.abrirModal();
  }

  confirmarEliminarClase(clase: Clase): void
  {
    this.accionModal = 'eliminar';
    this.tipoModal = 'clase';
    this.claseSeleccionada = clase;
    this.abrirModal();
  }

  guardarClase(): void
  {
    if (this.claseForm.invalid) return;

    const data = this.claseForm.value;
    const idInstructor = data.id_instructor ? Number(data.id_instructor) : null;

    if (this.accionModal === 'crear')
    {
      const requests = data.horarios.map((h: any) =>
        this.deporteService.createClase({
          id_deporte: Number(data.id_deporte),
          id_instructor: idInstructor,
          dia: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          cancha: data.cancha || null,
          activa: data.activa ?? true
        })
      );

      forkJoin(requests).subscribe({
        next: () =>
        {
          this.cerrarModal();
          this.cargarClases();
          this.mostrarMensaje('Clases creadas exitosamente');
        },
        error: (err) =>
        {
          console.error(err);
          this.mostrarMensaje('Error al crear las clases', 'error');
        }
      });

    } else if (this.accionModal === 'editar' && this.claseSeleccionada)
    {
      const idInstructor = data.id_instructor ? Number(data.id_instructor) : null;

      const requests = data.horarios.map((h: any) =>
      {
        const payload = {
          id_deporte: Number(data.id_deporte),
          id_instructor: idInstructor,
          dia: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          cancha: data.cancha || null,
          activa: data.activa
        };

        if (h.id_clase)
        {
          // Fila existente → actualizar
          return this.deporteService.updateClase(h.id_clase, payload);
        } else
        {
          // Fila nueva (el usuario agregó un día extra) → crear
          return this.deporteService.createClase(payload);
        }
      });

      forkJoin(requests).subscribe({
        next: () =>
        {
          this.cerrarModal();
          this.cargarClases();
          this.mostrarMensaje('Clase actualizada exitosamente');
        },
        error: (err) =>
        {
          console.error(err);
          this.mostrarMensaje('Error al actualizar la clase', 'error');
        }
      });
    }
  }

  toggleEstadoClase(clase: Clase): void
  {
    this.deporteService.toggleClase(clase.id_clase).subscribe({
      next: () =>
      {
        this.cargarClases();
        this.mostrarMensaje(`Clase ${clase.activa ? 'desactivada' : 'activada'}`);
      },
      error: (err) =>
      {
        console.error(err);
        this.mostrarMensaje('Error al cambiar estado de la clase', 'error');
      }
    });
  }

  // ==================== INSTRUCTORES ====================

  get instructoresFiltrados(): Instructor[]
  {
    if (!this.filtroInstructor) return this.instructores;
    return this.instructores.filter(i =>
      i.nombre.toLowerCase().includes(this.filtroInstructor.toLowerCase()) ||
      i.apellido.toLowerCase().includes(this.filtroInstructor.toLowerCase())
    );
  }

  abrirModalInstructor(accion: 'crear' | 'ver' | 'editar', instructor?: Instructor): void
  {
    this.accionModal = accion;
    this.tipoModal = 'instructor';
    this.instructorSeleccionado = instructor || null;

    if (accion === 'crear')
    {
      this.instructorForm.reset({ activo: true });
    } else if (instructor && accion !== 'ver')
    {
      this.instructorForm.patchValue(instructor);
    }

    this.abrirModal();
  }

  confirmarEliminarInstructor(instructor: Instructor): void
  {
    this.accionModal = 'eliminar';
    this.tipoModal = 'instructor';
    this.instructorSeleccionado = instructor;
    this.abrirModal();
  }

  guardarInstructor(): void
  {
    if (this.instructorForm.invalid) return;

    const data = this.instructorForm.value;

    if (this.accionModal === 'crear')
    {
      this.deporteService.createInstructor(data).subscribe({
        next: () =>
        {
          this.cerrarModal();
          this.cargarInstructores();
          this.mostrarMensaje('Instructor creado exitosamente');
        },
        error: (err) =>
        {
          console.error(err);
          this.mostrarMensaje('Error al crear el instructor', 'error');
        }
      });
    } else if (this.accionModal === 'editar' && this.instructorSeleccionado)
    {
      this.deporteService.updateInstructor(this.instructorSeleccionado.id_instructores, data).subscribe({
        next: () =>
        {
          this.cerrarModal();
          this.cargarInstructores();
          this.cargarClases();
          this.mostrarMensaje('Instructor actualizado exitosamente');
        },
        error: (err) =>
        {
          console.error(err);
          this.mostrarMensaje('Error al actualizar el instructor', 'error');
        }
      });
    }
  }

  eliminarInstructor(): void
  {
    if (!this.instructorSeleccionado) return;

    this.deporteService.deleteInstructor(this.instructorSeleccionado.id_instructores).subscribe({
      next: () =>
      {
        this.cerrarModal();
        this.cargarInstructores();
        this.cargarClases();
        this.mostrarMensaje('Instructor desactivado exitosamente');
      },
      error: (err) =>
      {
        console.error(err);
        this.mostrarMensaje('Error al desactivar el instructor', 'error');
      }
    });
  }

  toggleEstadoInstructor(instructor: Instructor): void
  {
    const endpoint = instructor.activo ? 'deleteInstructor' : 'activateInstructor';

    this.deporteService[endpoint](instructor.id_instructores).subscribe({
      next: () =>
      {
        this.cargarInstructores();
        this.mostrarMensaje(`Instructor ${instructor.activo ? 'desactivado' : 'activado'}`);
      },
      error: (err) =>
      {
        console.error(err);
        this.mostrarMensaje('Error al cambiar estado del instructor', 'error');
      }
    });
  }

  // ==================== MODAL ====================

  abrirModal(): void
  {
    const modalEl = document.getElementById('crudModal');
    if (modalEl)
    {
      this.modalInstance = new bootstrap.Modal(modalEl);
      this.modalInstance.show();
    }
  }

  cerrarModal(): void
  {
    if (this.modalInstance)
    {
      this.modalInstance.hide();
    }
    this.deporteSeleccionado = null;
    this.claseSeleccionada = null;
    this.instructorSeleccionado = null;
  }

  getDeporteNombre(idDeporte: number): string
  {
    const deporte = this.deportes.find(d => d.id_deportes === idDeporte);
    return deporte?.nombre || 'N/A';
  }

  getInstructorNombre(idInstructor?: number): string
  {
    if (!idInstructor) return 'Sin asignar';
    const instructor = this.instructores.find(i => i.id_instructores === idInstructor);
    return instructor ? `${instructor.nombre} ${instructor.apellido}` : 'N/A';
  }

  formatearHora(hora: string): string
  {
    return hora.substring(0, 5);
  }

  mostrarMensaje(mensaje: string, tipo: 'success' | 'error' = 'success'): void
  {
    alert(mensaje);
  }

  cambiarTab(tab: 'deportes' | 'clases' | 'instructores'): void
  {
    this.tabActiva = tab;
  }

  onDiaChange(event: any)
  {
    const diasSeleccionados = this.claseForm.value.dias as string[];

    if (event.target.checked)
    {
      diasSeleccionados.push(event.target.value);
    } else
    {
      const index = diasSeleccionados.indexOf(event.target.value);
      if (index >= 0)
      {
        diasSeleccionados.splice(index, 1);
      }
    }

    this.claseForm.patchValue({ dias: diasSeleccionados });
  }

  get horarios()
  {
    return this.claseForm.get('horarios') as FormArray;
  }
  agregarHorario()
  {
    const primerHorario = this.horarios.length > 0 ? this.horarios.at(0).value : null;

    const horario = this.fb.group({
      dia: [primerHorario?.dia || '', Validators.required],
      hora_inicio: [primerHorario?.hora_inicio || '', Validators.required],
      hora_fin: [primerHorario?.hora_fin || '', Validators.required]
    });

    this.horarios.push(horario);
  }

  eliminarHorario(index: number)
  {
    this.horarios.removeAt(index);
  }

  aplicarFiltroClases(): void
  {
    let clases = this.clases;

    if (this.filtroClase)
    {
      clases = clases.filter(c =>
        c.deporte_nombre?.toLowerCase().includes(this.filtroClase.toLowerCase()) ||
        c.dia.toLowerCase().includes(this.filtroClase.toLowerCase())
      );
    }

    this.clasesFiltradas = this.agruparClases(clases);
  }

  agruparClases(clases: Clase[]): any[]
  {
    const grupos: { [key: string]: any } = {};

    clases.forEach(clase =>
    {
      // Agrupar solo por deporte + instructor + cancha
      const key = `${clase.id_deporte}-${clase.id_instructor ?? 'null'}-${clase.cancha ?? ''}`;

      if (!grupos[key])
      {
        grupos[key] = {
          ...clase,
          horarios: [{
            dia: clase.dia,
            hora_inicio: clase.hora_inicio,
            hora_fin: clase.hora_fin,
            id_clase: clase.id_clase
          }],
          ids: [clase.id_clase]
        };
      } else
      {
        grupos[key].horarios.push({
          dia: clase.dia,
          hora_inicio: clase.hora_inicio,
          hora_fin: clase.hora_fin,
          id_clase: clase.id_clase
        });
        grupos[key].ids.push(clase.id_clase);
      }
    });

    return Object.values(grupos);
  }
  toggleEstadoClaseGrupo(grupo: any): void
  {
    const requests = grupo.ids.map((id: number) => this.deporteService.toggleClase(id));
    forkJoin(requests).subscribe({
      next: () =>
      {
        this.cargarClases();
        this.mostrarMensaje('Estado actualizado');
      },
      error: (err) => this.mostrarMensaje('Error al cambiar estado', 'error')
    });
  }

  confirmarEliminarClaseGrupo(grupo: any): void
  {
    this.accionModal = 'eliminar';
    this.tipoModal = 'clase';
    // Usar la primera clase como referencia para el modal
    this.claseSeleccionada = { ...grupo, id_clase: grupo.ids[0] };
    this._idsEliminar = grupo.ids;
    this.abrirModal();
  }

  // Agregar esta propiedad en la clase
  private _idsEliminar: number[] = [];

  eliminarClase(): void
  {
    const ids = this._idsEliminar.length > 0 ? this._idsEliminar : [this.claseSeleccionada!.id_clase];
    const requests = ids.map(id => this.deporteService.deleteClase(id));

    forkJoin(requests).subscribe({
      next: () =>
      {
        this.cerrarModal();
        this.cargarClases();
        this._idsEliminar = [];
        this.mostrarMensaje('Clase eliminada exitosamente');
      },
      error: (err) => this.mostrarMensaje('Error al eliminar la clase', 'error')
    });
  }
}