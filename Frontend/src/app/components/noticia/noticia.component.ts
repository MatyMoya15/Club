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
    this.route.params.subscribe(params => {
      const id = +params['id'];
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

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('es-AR', opciones);
  }

  getCategoria(): string {
    if (!this.noticia) return 'Noticias';
    
    const titulo = this.noticia.titulo.toLowerCase();
    
    if (titulo.includes('fútbol') || titulo.includes('futbol') || titulo.includes('partido')) {
      return 'Fútbol';
    } else if (titulo.includes('hockey')) {
      return 'Hockey';
    } else if (titulo.includes('socio') || titulo.includes('comunidad')) {
      return 'Comunidad';
    } else if (titulo.includes('infantil') || titulo.includes('juvenil')) {
      return 'Fútbol Infantil';
    } else {
      return 'Noticias';
    }
  }

  // ⬇️ ARREGLADO: Sin placeholder hardcodeado
  getImageUrl(): string {
    if (this.noticia?.imagen) {
      return this.noticia.imagen;
    }
    // Placeholder genérico solo si NO hay imagen
    return 'https://via.placeholder.com/1200x500/dc2626/ffffff?text=Sin+Imagen';
  }

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