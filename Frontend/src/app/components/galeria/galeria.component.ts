import { Component, HostListener, OnDestroy } from '@angular/core';

export interface FotoGaleria
{
  id: number;
  src: string;
  alt: string;
  titulo: string;
  descripcion: string;
  fecha?: string;
  categoria?: string;
}

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.css']
})
export class GaleriaComponent implements OnDestroy
{

  fotoSeleccionada: FotoGaleria | null = null;
  categoriaActiva: string = 'Todas';

  fotos: FotoGaleria[] = [
    {
      id: 1,
      src: 'assets/galeria/cocina.png',
      alt: 'Compra de cocina industrial',
      titulo: 'Compra de cocina industrial',
      descripcion: 'Se realizó la compra de una cocina industrial para la institución.',
      fecha: 'Marzo 2024',
      categoria: 'Institucional'
    },
    {
      id: 2,
      src: 'assets/galeria/pelotas-nassau.png',
      alt: 'Donación de pelotas',
      titulo: 'Donación de pelotas',
      descripcion: 'Se recibió una donación de 10 pelotas de fútbol "Nassau".',
      fecha: 'Marzo 2024',
      categoria: 'Institucional'
    },
    {
      id: 3,
      src: 'assets/galeria/torre-iluminacion.png',
      alt: 'Torres de iluminación',
      titulo: 'Torres de iluminación',
      descripcion: 'Gracias a la colaboración de ... se logró la realización de las torres de iluminación para el predio.',
      fecha: 'Marzo 2025',
      categoria: 'Institucional'
    },
    {
      id: 4,
      src: 'assets/galeria/encargado-torres.jpg',
      alt: 'Encargados de torres',
      titulo: 'Encargados de torres.',
      descripcion: 'Nombre y nombre, fueron los encargados de soldar las torres de iluminación.',
      fecha: 'Diciembre 2023',
      categoria: 'Institucional'
    },
    {
      id: 4,
      src: 'assets/galeria/encargado-torres.jpg',
      alt: 'Encargados de torres',
      titulo: 'Encargados de torres.',
      descripcion: 'Nombre y nombre, fueron los encargados de soldar las torres de iluminación.',
      fecha: 'Diciembre 2023',
      categoria: 'Deportes'
    },
    {
      id: 7,
      src: 'assets/galeria/dia-del-nino.jpg',
      alt: 'Festejo día del niño',
      titulo: 'Celebración del Día del Niño',
      descripcion: 'El club organizó una jornada especial con juegos, actividades y sorpresas para los hijos de los socios en el Día del Niño.',
      fecha: 'Agosto 2023',
      categoria: 'Eventos'
    },
    {
      id: 11,
      src: 'assets/galeria/maratón.jpg',
      alt: 'Maratón del club',
      titulo: '1° Maratón Anual del Club',
      descripcion: 'Primera edición de la maratón anual con más de 300 corredores participando en los recorridos de 5K y 10K por las calles del barrio.',
      fecha: 'Abril 2023',
      categoria: 'Torneos'
    }
  ];

  get categorias(): string[]
  {
    const cats = ['Todas', ...new Set(this.fotos.map(f => f.categoria || ''))];
    return cats;
  }

  get fotosFiltradas(): FotoGaleria[]
  {
    if (this.categoriaActiva === 'Todas') return this.fotos;
    return this.fotos.filter(f => f.categoria === this.categoriaActiva);
  }

  filtrarPorCategoria(cat: string): void
  {
    this.categoriaActiva = cat;
  }

  abrirFoto(foto: FotoGaleria): void
  {
    this.fotoSeleccionada = foto;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void
  {
    this.fotoSeleccionada = null;
    document.body.style.overflow = '';
  }

  fotoAnterior(): void
  {
    if (!this.fotoSeleccionada) return;
    const lista = this.fotosFiltradas;
    const idx = lista.findIndex(f => f.id === this.fotoSeleccionada!.id);
    const prev = lista[(idx - 1 + lista.length) % lista.length];
    this.fotoSeleccionada = prev;
  }

  fotoSiguiente(): void
  {
    if (!this.fotoSeleccionada) return;
    const lista = this.fotosFiltradas;
    const idx = lista.findIndex(f => f.id === this.fotoSeleccionada!.id);
    const next = lista[(idx + 1) % lista.length];
    this.fotoSeleccionada = next;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void
  {
    if (!this.fotoSeleccionada) return;
    if (e.key === 'Escape') this.cerrarModal();
    if (e.key === 'ArrowLeft') this.fotoAnterior();
    if (e.key === 'ArrowRight') this.fotoSiguiente();
  }

  ngOnDestroy(): void
  {
    document.body.style.overflow = '';
  }
}