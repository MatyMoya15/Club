import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NoticiaService, Noticia } from 'src/app/service/noticias.service';

@Component({
  selector: 'app-noticia',
  templateUrl: './noticia.component.html',
  styleUrls: ['./noticia.component.css']
})
export class NoticiaComponent implements OnInit {
  noticia: Noticia | null = null;
  isLoading: boolean = true;
  notFound: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private noticiaService: NoticiaService
  ) {}

  ngOnInit(): void {
    // Obtener el ID de la noticia desde la URL
    this.route.params.subscribe(params => {
      const id = +params['id']; // El + convierte string a number
      if (id) {
        this.cargarNoticia(id);
      } else {
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  cargarNoticia(id: number): void {
    this.isLoading = true;
    this.notFound = false;

    this.noticiaService.getNoticiaById(id).subscribe({
      next: (noticia) => {
        this.noticia = noticia;
        this.isLoading = false;
        console.log('✅ Noticia cargada:', noticia);
      },
      error: (error) => {
        console.error('❌ Error al cargar noticia:', error);
        this.notFound = true;
        this.isLoading = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  // Formatear fecha
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-AR', opciones);
  }

  // Determinar categoría
  getCategoria(): string {
    if (!this.noticia) return 'Noticias';
    
    const titulo = this.noticia.titulo.toLowerCase();
    
    if (titulo.includes('fútbol') || titulo.includes('futbol') || titulo.includes('partido')) {
      return 'Fútbol';
    } else if (titulo.includes('hockey')) {
      return 'Hockey';
    } else if (titulo.includes('socio') || titulo.includes('comunidad')) {
      return 'Comunidad';
    } else {
      return 'Noticias';
    }
  }

  // Obtener imagen o placeholder
  getImageUrl(): string {
    return this.noticia?.imagen || 'https://www.ole.com.ar/2023/05/13/S35qjoqk2_1290x760__2.jpg';
  }

  // Compartir en redes sociales
  compartirFacebook(): void {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }

  compartirTwitter(): void {
    const url = window.location.href;
    const texto = this.noticia?.titulo || 'Noticia del club';
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`, '_blank');
  }
}