import { Component, OnInit } from '@angular/core';
import { AuthService, User } from 'src/app/service/auth.service';

@Component({
  selector: 'app-carnet',
  templateUrl: './carnet.component.html',
  styleUrls: ['./carnet.component.css']
})
export class CarnetComponent implements OnInit {

  currentUser: User | null = null;
  currentYear: number = new Date().getFullYear();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  getIniciales(): string {
    if (!this.currentUser) return 'US';
    const n = this.currentUser.nombre?.charAt(0).toUpperCase() || '';
    const a = this.currentUser.apellido?.charAt(0).toUpperCase() || '';
    return `${n}${a}`;
  }

  getNombreCompleto(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.nombre} ${this.currentUser.apellido}`;
  }

  getFechaAfiliacion(): string {
    if (!this.currentUser?.fecha_alta) return 'No disponible';
    return new Date(this.currentUser.fecha_alta).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  getFechaVencimiento(): string {
    return `31/12/${this.currentYear}`;
  }

  // Imprime el carnet tal cual se ve en pantalla: se clona el elemento y se copian
  // los estilos de la app, así no hay que mantener el diseño duplicado.
  imprimirCarnet(): void {
    const carnetEl = document.querySelector('.carnet-card') as HTMLElement | null;
    if (!carnetEl) return;

    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) {
      alert('Permití las ventanas emergentes para poder imprimir el carnet');
      return;
    }

    const estilos = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(el => el.outerHTML)
      .join('\n');

    ventana.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <base href="${document.baseURI}">
    <title>Carnet - ${this.getNombreCompleto()}</title>
    ${estilos}
    <style>
      @page { size: A4; margin: 15mm; }
      html, body {
        height: auto !important;
        min-height: 0 !important;
        margin: 0;
        background: #fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body { display: flex; justify-content: center; padding: 15mm 0; }
      /* Tamaño de impresión del carnet (ancho). El alto sale solo por la proporción */
      .carnet-card { width: 100mm !important; max-width: none !important; flex: none; }
    </style>
  </head>
  <body>
    ${carnetEl.outerHTML}
    <script>
      window.onload = function () {
        setTimeout(function () { window.print(); }, 300);
        window.onafterprint = function () { window.close(); };
      };
    <\/script>
  </body>
</html>`);
    ventana.document.close();
  }

  descargarCarnet(): void {
    this.imprimirCarnet();
  }

}