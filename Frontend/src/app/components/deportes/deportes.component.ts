import { Component, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { 
  DeporteService, 
  Deporte, 
  Clase, 
  Instructor 
} from 'src/app/service/deportes.service';

interface DeporteConClases {
  deporte: Deporte;
  clasesPorCategoria: { [categoria: string]: Clase[] };
}

@Component({
  selector: 'app-deportes',
  templateUrl: './deportes.component.html',
  styleUrls: ['./deportes.component.css']
})
export class DeportesComponent implements OnInit {
  deportes: DeporteConClases[] = [];
  instructores: Instructor[] = [];
  isLoading: boolean = true;
  error: string = '';

  // Días de la semana en orden
  diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(
    private viewportScroller: ViewportScroller,
    private route: ActivatedRoute,
    private deporteService: DeporteService
  ) {}

  ngOnInit() {
    this.cargarDatos();

    // Manejar scroll a fragmento
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {
          this.viewportScroller.scrollToAnchor(fragment);
        }, 300);
      }
    });
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.error = '';

    // Cargar deportes
    this.deporteService.getAllDeportes().subscribe({
      next: (deportes) => {
        // Cargar clases
        this.deporteService.getAllClases(true).subscribe({
          next: (clases) => {
            // Cargar instructores
            this.deporteService.getAllInstructores(true).subscribe({
              next: (instructores) => {
                this.instructores = instructores;
                this.procesarDatos(deportes, clases);
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Error al cargar instructores:', err);
                this.error = 'Error al cargar la información de instructores';
                this.isLoading = false;
              }
            });
          },
          error: (err) => {
            console.error('Error al cargar clases:', err);
            this.error = 'Error al cargar la información de clases';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar deportes:', err);
        this.error = 'Error al cargar la información de deportes';
        this.isLoading = false;
      }
    });
  }

  procesarDatos(deportes: Deporte[], clases: Clase[]): void {
    this.deportes = deportes.map(deporte => {
      // Filtrar clases activas de este deporte
      const clasesDeporte = clases.filter(
        clase => clase.id_deporte === deporte.id_deportes && clase.activa
      );

      // Agrupar clases por categoría (cancha por ahora, luego será categoría)
      const clasesPorCategoria: { [categoria: string]: Clase[] } = {};
      
      clasesDeporte.forEach(clase => {
        // Usar cancha como categoría temporal
        const categoria = clase.cancha || 'General';
        
        if (!clasesPorCategoria[categoria]) {
          clasesPorCategoria[categoria] = [];
        }
        
        clasesPorCategoria[categoria].push(clase);
      });

      // Ordenar clases por día y hora
      Object.keys(clasesPorCategoria).forEach(categoria => {
        clasesPorCategoria[categoria].sort((a, b) => {
          const diaA = this.diasOrden.indexOf(a.dia);
          const diaB = this.diasOrden.indexOf(b.dia);
          
          if (diaA !== diaB) {
            return diaA - diaB;
          }
          
          return a.hora_inicio.localeCompare(b.hora_inicio);
        });
      });

      return {
        deporte,
        clasesPorCategoria
      };
    });
  }

  getInstructorNombre(idInstructor?: number): string {
    if (!idInstructor) return 'Por asignar';
    
    const instructor = this.instructores.find(
      i => i.id_instructores === idInstructor
    );
    
    return instructor 
      ? `${instructor.nombre} ${instructor.apellido}` 
      : 'No disponible';
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  getDiasClase(clases: Clase[]): string {
    const dias = [...new Set(clases.map(c => c.dia))];
    return dias.join(', ');
  }

  getHorariosClase(clases: Clase[]): string {
    const horarios = clases.map(
      c => `${this.formatearHora(c.hora_inicio)} - ${this.formatearHora(c.hora_fin)}`
    );
    return [...new Set(horarios)].join(' / ');
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto);
  }

  // Generar ID para fragmentos (anclas)
  generarIdDeporte(nombre: string): string {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
  }

  // Verificar si hay clases para mostrar
  tieneClases(deporteConClases: DeporteConClases): boolean {
    return Object.keys(deporteConClases.clasesPorCategoria).length > 0;
  }

  // Obtener categorías de un deporte
  getCategorias(deporteConClases: DeporteConClases): string[] {
    return Object.keys(deporteConClases.clasesPorCategoria);
  }
}