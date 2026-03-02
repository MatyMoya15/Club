import { Component, OnInit, HostListener } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import
  {
    DeporteService,
    Deporte,
    Clase,
    Instructor
  } from 'src/app/service/deportes.service';

interface DeporteConClases
{
  deporte: Deporte;
  clasesPorCategoria: { [categoria: string]: Clase[] };
}

const PALABRAS_ACTIVIDAD = ['aeróbico', 'aerobico', 'funcional', 'yoga', 'pilates', 'zumba', 'crossfit', 'gimnasia'];

const ICONOS: { [key: string]: string } = {
  'fútbol': 'fas fa-futbol',
  'futbol': 'fas fa-futbol',
  'hockey': 'fas fa-hockey-puck',
  'básquet': 'fas fa-basketball-ball',
  'basquet': 'fas fa-basketball-ball',
  'tenis': 'fas fa-table-tennis',
  'natación': 'fas fa-swimmer',
  'natacion': 'fas fa-swimmer',
  'aeróbico': 'fas fa-heart-pulse',
  'aerobico': 'fas fa-heart-pulse',
  'funcional': 'fas fa-dumbbell',
  'yoga': 'fas fa-spa',
  'pilates': 'fas fa-spa',
  'zumba': 'fas fa-music',
  'crossfit': 'fas fa-fire',
};

@Component({
  selector: 'app-deportes',
  templateUrl: './deportes.component.html',
  styleUrls: ['./deportes.component.css']
})
export class DeportesComponent implements OnInit
{
  deportes: DeporteConClases[] = [];
  instructores: Instructor[] = [];
  isLoading = true;
  error = '';

  deportesPrincipales: DeporteConClases[] = [];
  actividades: DeporteConClases[] = [];

  openDeportes = new Set<number>();

  seccionActiva = '';

  diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(
    private viewportScroller: ViewportScroller,
    private route: ActivatedRoute,
    private deporteService: DeporteService
  ) { }

  ngOnInit()
  {
    this.cargarDatos();

    this.route.fragment.subscribe(fragment =>
    {
      if (fragment)
      {
        setTimeout(() =>
        {
          this.viewportScroller.scrollToAnchor(fragment);
          this.seccionActiva = fragment;
          const deporteData = this.deportes.find(
            d => this.generarIdDeporte(d.deporte.nombre) === fragment
          );
          if (deporteData)
          {
            this.openDeportes.add(deporteData.deporte.id_deportes);
          }
        }, 300);
      }
    });
  }

  cargarDatos(): void
  {
    this.isLoading = true;
    this.error = '';

    this.deporteService.getAllDeportes().subscribe({
      next: (deportes) =>
      {
        this.deporteService.getAllClases(true).subscribe({
          next: (clases) =>
          {
            this.deporteService.getAllInstructores(true).subscribe({
              next: (instructores) =>
              {
                this.instructores = instructores;
                this.procesarDatos(deportes, clases);
                this.isLoading = false;
              },
              error: (err) =>
              {
                console.error('Error instructores:', err);
                this.error = 'Error al cargar instructores';
                this.isLoading = false;
              }
            });
          },
          error: (err) =>
          {
            console.error('Error clases:', err);
            this.error = 'Error al cargar clases';
            this.isLoading = false;
          }
        });
      },
      error: (err) =>
      {
        console.error('Error deportes:', err);
        this.error = 'Error al cargar deportes';
        this.isLoading = false;
      }
    });
  }

  procesarDatos(deportes: Deporte[], clases: Clase[]): void
  {
    this.deportes = deportes.map(deporte =>
    {
      const clasesDeporte = clases.filter(
        c => c.id_deporte === deporte.id_deportes && c.activa
      );

      const clasesPorCategoria: { [cat: string]: Clase[] } = {};
      clasesDeporte.forEach(clase =>
      {
        const cat = clase.cancha || 'General';
        if (!clasesPorCategoria[cat]) clasesPorCategoria[cat] = [];
        clasesPorCategoria[cat].push(clase);
      });

      Object.keys(clasesPorCategoria).forEach(cat =>
      {
        clasesPorCategoria[cat].sort((a, b) =>
        {
          const dA = this.diasOrden.indexOf(a.dia);
          const dB = this.diasOrden.indexOf(b.dia);
          return dA !== dB ? dA - dB : a.hora_inicio.localeCompare(b.hora_inicio);
        });
      });

      return { deporte, clasesPorCategoria };
    });

    this.deportesPrincipales = this.deportes.filter(d => !this.esActividad(d.deporte.nombre));
    this.actividades = this.deportes.filter(d => this.esActividad(d.deporte.nombre));

    if (this.deportesPrincipales.length > 0)
    {
      this.openDeportes.add(this.deportesPrincipales[0].deporte.id_deportes);
    }
    if (this.actividades.length > 0)
    {
      this.openDeportes.add(this.actividades[0].deporte.id_deportes);
    }
  }

  esActividad(nombre: string): boolean
  {
    const n = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return PALABRAS_ACTIVIDAD.some(p =>
      n.includes(p.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    );
  }

  getIconoDeporte(nombre: string): string
  {
    const n = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const key of Object.keys(ICONOS))
    {
      if (n.includes(key.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))
      {
        return ICONOS[key];
      }
    }
    return 'fas fa-running';
  }

  toggleDeporte(id: number): void
  {
    if (this.openDeportes.has(id))
    {
      this.openDeportes.delete(id);
    } else
    {
      this.openDeportes.add(id);
    }
  }

  isOpen(id: number): boolean
  {
    if (window.innerWidth >= 901)
    {
      return true; // Siempre abierto en desktop
    }
    return this.openDeportes.has(id); // Acordeón en mobile
  }
  scrollToTop(): void
  {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.seccionActiva = '';
  }

  getInstructorNombre(idInstructor?: number): string
  {
    if (!idInstructor) return 'Por asignar';
    const i = this.instructores.find(x => x.id_instructores === idInstructor);
    return i ? `${i.nombre} ${i.apellido}` : 'No disponible';
  }

  formatearHora(hora: string): string
  {
    return hora.substring(0, 5);
  }

  getDiasClase(clases: Clase[]): string
  {
    const dias = [...new Set(clases.map(c => c.dia))];
    return dias.join(', ');
  }

  getHorariosClase(clases: Clase[]): string
  {
    const hs = clases.map(c => `${this.formatearHora(c.hora_inicio)} - ${this.formatearHora(c.hora_fin)}`);
    return [...new Set(hs)].join(' / ');
  }

  formatearMonto(monto: number): string
  {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto);
  }

  generarIdDeporte(nombre: string): string
  {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
  }

  tieneClases(d: DeporteConClases): boolean
  {
    return Object.keys(d.clasesPorCategoria).length > 0;
  }

  getCategorias(d: DeporteConClases): string[]
  {
    return Object.keys(d.clasesPorCategoria);
  }
}