import { Component, OnInit } from '@angular/core';
import { NoticiaService, Noticia } from 'src/app/service/noticias.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  noticiaDestacada: Noticia | null = null;
  noticiasSecundarias: Noticia[] = [];
  isLoading: boolean = true;

  constructor(
    private noticiaService: NoticiaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias(): void {
    this.isLoading = true;

    this.noticiaService.getAllNoticias(true).subscribe({
      next: (noticias) => {
        // Filtrar solo noticias publicadas (simplificado - si tiene fecha, está publicada)
        const noticiasPublicadas = noticias.filter(n => !!n.publicacion);

        console.log('🔍 Debug noticias:', {
          total: noticias.length,
          publicadas: noticiasPublicadas.length,
          noticias: noticias.map(n => ({
            titulo: n.titulo,
            publicacion: n.publicacion,
            tienePublicacion: !!n.publicacion
          }))
        });

        // La primera noticia es la destacada
        this.noticiaDestacada = noticiasPublicadas[0] || null;

        // Las siguientes 3 son secundarias
        this.noticiasSecundarias = noticiasPublicadas.slice(1, 4);

        this.isLoading = false;
        console.log('✅ Noticias cargadas:', {
          destacada: this.noticiaDestacada?.titulo,
          secundarias: this.noticiasSecundarias.length
        });
      },
      error: (error) => {
        console.error('❌ Error al cargar noticias:', error);
        this.isLoading = false;
      }
    });
  }

  verNoticia(id: number): void {
    this.router.navigate(['/noticia', id]);
  }

  // Truncar texto para preview
  truncateText(text: string, limit: number = 150): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  // Obtener imagen o placeholder
  getImageUrl(noticia: Noticia): string {
    return noticia.imagen || 'https://i.ytimg.com/vi/7xWxpunlZ2w/maxresdefault.jpg';
  }

  // Determinar categoría (puedes personalizarlo)
  getCategoria(noticia: Noticia): string {
    const titulo = noticia.titulo.toLowerCase();
    
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
}