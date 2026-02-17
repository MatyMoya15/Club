import { Component } from '@angular/core';
import { NgModule } from '@angular/core';

interface Noticia {
  id: number;
  titulo: string;
  contenido: string;
  fecha: Date;
  imagen?: string;
}

interface Socio {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fechaAlta: Date;
  estado: 'activo' | 'inactivo';
}

interface Cuota {
  id: number;
  categoria: string;
  precio: number | undefined;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  seccionActiva: string = 'noticias';

  // Datos de Noticias
  noticias: Noticia[] = [
    {
      id: 1,
      titulo: 'Victoria del equipo senior',
      contenido: 'El equipo senior ganó 3-1 en el último partido del torneo...',
      fecha: new Date('2025-09-20')
    },
    {
      id: 2,
      titulo: 'Nuevo entrenador de juveniles',
      contenido: 'Damos la bienvenida a nuestro nuevo entrenador...',
      fecha: new Date('2025-09-15')
    }
  ];

  noticiaEditando: Noticia | null = null;
  nuevaNoticia: Partial<Noticia> = {};
  modoEdicion: boolean = false;

  // Datos de Socios
  socios: Socio[] = [
    {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '35123456',
      email: 'juan.perez@email.com',
      telefono: '299-1234567',
      fechaAlta: new Date('2024-01-15'),
      estado: 'activo'
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'González',
      dni: '38654321',
      email: 'maria.gonzalez@email.com',
      telefono: '299-7654321',
      fechaAlta: new Date('2024-03-20'),
      estado: 'activo'
    },
    {
      id: 3,
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      dni: '32987654',
      email: 'carlos.rodriguez@email.com',
      telefono: '299-9876543',
      fechaAlta: new Date('2023-11-10'),
      estado: 'inactivo'
    }
  ];

  sociosFiltrados: Socio[] = [...this.socios];
  filtroEstado: string = 'todos';
  busquedaSocio: string = '';

  // Datos de Cuotas
  cuotas: Cuota[] = [
    { id: 1, categoria: 'Socio Infantil', precio: 5000 },
    { id: 2, categoria: 'Socio Juvenil', precio: 7000 },
    { id: 3, categoria: 'Socio Adulto', precio: 10000 },
    { id: 4, categoria: 'Socio Vitalicio', precio: 8000 }
  ];

  cuotaEditando: Cuota | null = null;

  // Métodos de Navegación
  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
  }

  // Métodos de Noticias
  agregarNoticia(): void {
    this.modoEdicion = true;
    this.nuevaNoticia = {
      titulo: '',
      contenido: '',
      fecha: new Date()
    };
  }

  guardarNoticia(): void {
    if (this.noticiaEditando) {
      const index = this.noticias.findIndex(n => n.id === this.noticiaEditando!.id);
      if (index !== -1) {
        this.noticias[index] = { ...this.noticiaEditando };
      }
    } else if (this.nuevaNoticia.titulo && this.nuevaNoticia.contenido) {
      const noticia: Noticia = {
        id: this.noticias.length + 1,
        titulo: this.nuevaNoticia.titulo,
        contenido: this.nuevaNoticia.contenido,
        fecha: new Date(),
        imagen: this.nuevaNoticia.imagen
      };
      this.noticias.unshift(noticia);
    }
    this.cancelarEdicionNoticia();
  }

  editarNoticia(noticia: Noticia): void {
    this.modoEdicion = true;
    this.noticiaEditando = { ...noticia };
  }

  eliminarNoticia(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta noticia?')) {
      this.noticias = this.noticias.filter(n => n.id !== id);
    }
  }

  cancelarEdicionNoticia(): void {
    this.modoEdicion = false;
    this.noticiaEditando = null;
    this.nuevaNoticia = {};
  }

  // Métodos de Socios
  filtrarSocios(): void {
    this.sociosFiltrados = this.socios.filter(socio => {
      const cumpleFiltroEstado = this.filtroEstado === 'todos' || socio.estado === this.filtroEstado;
      const cumpleBusqueda = socio.nombre.toLowerCase().includes(this.busquedaSocio.toLowerCase()) ||
                             socio.apellido.toLowerCase().includes(this.busquedaSocio.toLowerCase()) ||
                             socio.dni.includes(this.busquedaSocio);
      return cumpleFiltroEstado && cumpleBusqueda;
    });
  }

  // Métodos de Cuotas
  editarCuota(cuota: Cuota): void {
    this.cuotaEditando = { ...cuota };
  }

  guardarCuota(): void {
    if (this.cuotaEditando) {
      const index = this.cuotas.findIndex(c => c.id === this.cuotaEditando!.id);
      if (index !== -1) {
        this.cuotas[index] = { ...this.cuotaEditando };
      }
      this.cuotaEditando = null;
    }
  }

  cancelarEdicionCuota(): void {
    this.cuotaEditando = null;
  }
}