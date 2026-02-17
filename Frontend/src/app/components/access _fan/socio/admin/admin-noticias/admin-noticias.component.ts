import { Component, OnInit } from '@angular/core';
import { NoticiaService, Noticia } from 'src/app/service/noticias.service';
import { AuthService } from 'src/app/service/auth.service';

interface NoticiaForm {
  titulo: string;
  subtitulo: string;
  cuerpo: string;
  imagen: string;
  imagenPreview: string;
  publicarAhora: boolean;
  publicada: boolean;
}

// Interface extendida para el template
interface NoticiaExtendida extends Noticia {
  id: number;
  fecha: string;
  publicada: boolean;
}

@Component({
  selector: 'app-admin-noticias',
  templateUrl: './admin-noticias.component.html',
  styleUrls: ['./admin-noticias.component.css']
})
export class AdminNoticiasComponent implements OnInit {
  // Datos
  noticias: NoticiaExtendida[] = [];
  
  // Estado del formulario
  modoEdicion: boolean = false;
  noticiaEditando: NoticiaExtendida | null = null;
  
  noticiaForm: NoticiaForm = {
    titulo: '',
    subtitulo: '',
    cuerpo: '',
    imagen: '',
    imagenPreview: '',
    publicarAhora: false,
    publicada: false
  };
  
  // UI State
  isLoading: boolean = true;
  isSaving: boolean = false;
  error: string = '';
  successMessage: string = '';
  isUploadingImage: boolean = false;

  constructor(
    private noticiaService: NoticiaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarNoticias();
    
    // Subscribirse a cambios en el cache
    this.noticiaService.noticias$.subscribe(noticias => {
      this.noticias = this.procesarNoticias(noticias);
    });
  }

  cargarNoticias(forceRefresh: boolean = false): void {
    this.isLoading = true;
    this.error = '';

    this.noticiaService.getAllNoticias(forceRefresh).subscribe({
      next: (noticias) => {
        console.log('✅ Noticias cargadas:', noticias.length);
        this.noticias = this.procesarNoticias(noticias);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar noticias:', error);
        this.error = 'Error al cargar las noticias';
        this.isLoading = false;
      }
    });
  }

private procesarNoticias(noticias: Noticia[]): NoticiaExtendida[] {
  return noticias.map(noticia => ({
    ...noticia,
    id: noticia.id_noticia,
    fecha: noticia.publicacion || noticia.creacion,
    publicada: !!noticia.publicacion // Si tiene fecha, está publicada
  }));
}

  // CRUD Operations
  agregarNoticia(): void {
    this.modoEdicion = true;
    this.noticiaEditando = null;
    this.resetForm();
  }

  editarNoticia(noticia: NoticiaExtendida): void {
    this.modoEdicion = true;
    this.noticiaEditando = noticia;
    
    this.noticiaForm = {
      titulo: noticia.titulo,
      subtitulo: noticia.subtitulo || '',
      cuerpo: noticia.cuerpo,
      imagen: noticia.imagen || '',
      imagenPreview: noticia.imagen || '',
      publicarAhora: false,
      publicada: noticia.publicada
    };
  }

  guardarNoticia(): void {
    if (!this.noticiaForm.titulo || !this.noticiaForm.cuerpo) {
      this.showError('Título y contenido son requeridos');
      return;
    }

    this.isSaving = true;
    this.error = '';

    const data = {
      titulo: this.noticiaForm.titulo,
      subtitulo: this.noticiaForm.subtitulo || undefined,
      cuerpo: this.noticiaForm.cuerpo,
      imagen: this.noticiaForm.imagen || undefined
    };

    if (this.noticiaEditando) {
      // Actualizar noticia existente
      this.noticiaService.updateNoticia(this.noticiaEditando.id_noticia, data).subscribe({
        next: (response) => {
          console.log('✅ Noticia actualizada:', response);
          this.showSuccess('Noticia actualizada exitosamente');
          
          // Si se marcó "publicar ahora" y no estaba publicada
          if (this.noticiaForm.publicarAhora && !this.noticiaForm.publicada) {
            this.publicarNoticia(this.noticiaEditando!.id_noticia);
          } else {
            this.cancelarEdicion();
            this.isSaving = false;
          }
        },
        error: (error) => {
          console.error('❌ Error al actualizar noticia:', error);
          this.showError('Error al actualizar la noticia');
          this.isSaving = false;
        }
      });
    } else {
      // Crear nueva noticia
      this.noticiaService.createNoticia(data).subscribe({
        next: (response) => {
          console.log('✅ Noticia creada:', response);
          this.showSuccess('Noticia creada exitosamente');
          
          // Si se marcó "publicar ahora"
          if (this.noticiaForm.publicarAhora) {
            this.publicarNoticia(response.noticia.id_noticia);
          } else {
            this.cancelarEdicion();
            this.isSaving = false;
          }
        },
        error: (error) => {
          console.error('❌ Error al crear noticia:', error);
          this.showError('Error al crear la noticia');
          this.isSaving = false;
        }
      });
    }
  }

  eliminarNoticia(id: number): void {
    const noticia = this.noticias.find(n => n.id === id);
    if (!confirm(`¿Estás seguro de eliminar la noticia "${noticia?.titulo}"?`)) {
      return;
    }

    // Usar id_noticia para la llamada al servicio
    const idNoticia = noticia?.id_noticia || id;

    this.noticiaService.deleteNoticia(idNoticia).subscribe({
      next: (response) => {
        console.log('✅ Noticia eliminada:', response);
        this.showSuccess('Noticia eliminada exitosamente');
      },
      error: (error) => {
        console.error('❌ Error al eliminar noticia:', error);
        this.showError('Error al eliminar la noticia');
      }
    });
  }
publicarNoticia(id: number): void {
  const noticia = this.noticias.find(n => n.id === id);
  const idNoticia = noticia?.id_noticia || id;

  console.log('🔵 Intentando publicar:', {
    id_simplificado: id,
    id_noticia: idNoticia,
    noticia_encontrada: noticia
  });

  this.noticiaService.publishNoticia(idNoticia).subscribe({
    next: (response) => {
      console.log('✅ Noticia publicada:', response);
      console.log('🔵 Fecha de publicacion:', response.noticia.publicacion);
      
      this.showSuccess('Noticia publicada exitosamente');
      this.cargarNoticias(true);
      this.cancelarEdicion();
      this.isSaving = false;
    },
    error: (error) => {
      console.error('❌ Error al publicar noticia:', error);
      this.showError('Error al publicar la noticia');
      this.isSaving = false;
    }
  });
}

despublicarNoticia(id: number): void {
  if (!confirm('¿Estás seguro de despublicar esta noticia?')) {
    return;
  }

  const noticia = this.noticias.find(n => n.id === id);
  const idNoticia = noticia?.id_noticia || id;

  console.log('🔵 Intentando despublicar:', {
    id_simplificado: id,
    id_noticia: idNoticia,
    noticia_encontrada: noticia
  });

  this.noticiaService.unpublishNoticia(idNoticia).subscribe({
    next: (response) => {
      console.log('✅ Noticia despublicada:', response);
      console.log('🔵 Fecha de publicacion (debe ser null):', response.noticia.publicacion);
      
      this.showSuccess('Noticia despublicada exitosamente');
      this.cargarNoticias(true);
    },
    error: (error) => {
      console.error('❌ Error al despublicar noticia:', error);
      this.showError('Error al despublicar la noticia');
    }
  });
}

// Manejo de imágenes
onImageSelected(event: any): void {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tamaño (máx 5MB)
  if (file.size > 5 * 1024 * 1024) {
    this.showError('La imagen no debe superar los 5MB');
    return;
  }

  // Validar tipo
  if (!file.type.startsWith('image/')) {
    this.showError('Solo se permiten imágenes');
    return;
  }

  // Preview local inmediato
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.noticiaForm.imagenPreview = e.target.result;
  };
  reader.readAsDataURL(file);

  // Subir a Cloudinary
  this.isUploadingImage = true;
  
  this.noticiaService.uploadImage(file).subscribe({
    next: (response) => {
      console.log('✅ Imagen subida a Cloudinary:', response.url);
      this.noticiaForm.imagen = response.url; // Guardar URL de Cloudinary
      this.isUploadingImage = false;
      this.showSuccess('Imagen subida exitosamente');
    },
    error: (error) => {
      console.error('❌ Error al subir imagen:', error);
      this.showError('Error al subir la imagen. Intenta de nuevo.');
      this.isUploadingImage = false;
      this.noticiaForm.imagenPreview = '';
    }
  });
}

  removerImagen(): void {
    this.noticiaForm.imagen = '';
    this.noticiaForm.imagenPreview = '';
  }

  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.noticiaEditando = null;
    this.resetForm();
  }

  private resetForm(): void {
    this.noticiaForm = {
      titulo: '',
      subtitulo: '',
      cuerpo: '',
      imagen: '',
      imagenPreview: '',
      publicarAhora: false,
      publicada: false
    };
  }

  // Helpers
  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private showError(message: string): void {
    this.error = message;
    setTimeout(() => {
      this.error = '';
    }, 5000);
  }

  getNoticiasPublicadas(): NoticiaExtendida[] {
    return this.noticias.filter(n => n.publicada);
  }

  getNoticiasBorrador(): NoticiaExtendida[] {
    return this.noticias.filter(n => !n.publicada);
  }

  // Truncar texto para preview
  truncateText(text: string, limit: number = 150): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }
}