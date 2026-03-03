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

imprimirCarnet(): void {
  const carnetEl = document.querySelector('.carnet-card') as HTMLElement;
  if (!carnetEl) return;

  const ventana = window.open('', '_blank', 'width=900,height=600');
  if (!ventana) return;

  ventana.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Carnet - ${this.getNombreCompleto()}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            background: #f8fafc; 
            display: flex; 
            justify-content: center; 
            align-items: center;
            min-height: 100vh;
            padding: 2rem;
            font-family: sans-serif;
          }
          .carnet-card {
            background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
            border-radius: 16px;
            padding: 2rem;
            color: white;
            width: 100%;
            max-width: 750px;
            position: relative;
            overflow: hidden;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .carnet-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
          }
          .club-badge { display: flex; align-items: center; gap: 1rem; }
          .badge-icon {
            width: 60px; height: 60px;
            background: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center; padding: 4px;
          }
          .badge-icon img { width: 100%; height: 100%; object-fit: contain; border-radius: 50%; }
          .badge-text h2 { font-size: 0.9rem; font-weight: 700; color: #fbbf24; letter-spacing: 1px; margin: 0; }
          .badge-text h3 { font-size: 1.1rem; font-weight: 800; color: white; margin: 0.25rem 0 0 0; }
          .type-badge {
            background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
            color: white; padding: 0.5rem 1rem; border-radius: 20px;
            font-size: 0.8rem; font-weight: 700; letter-spacing: 1px;
          }
          .carnet-body { display: flex; gap: 1.5rem; align-items: flex-start; }
          .avatar-iniciales-large {
            width: 80px; height: 80px; border-radius: 12px;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white; display: flex; align-items: center; justify-content: center;
            font-size: 1.75rem; font-weight: 700; flex-shrink: 0;
            border: 3px solid rgba(255,255,255,0.2);
          }
          .socio-name { font-size: 1.5rem; font-weight: 700; margin: 0 0 1.5rem 0; color: white; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
          .info-item { display: flex; flex-direction: column; gap: 0.25rem; }
          .info-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px; }
          .info-value { font-size: 0.9rem; font-weight: 600; color: white; }
          .carnet-footer {
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 2rem; padding-top: 1.5rem;
            border-top: 1px solid #374151;
          }
          .seal-text { font-size: 0.8rem; font-weight: 700; color: #fbbf24; letter-spacing: 1px; }
          .seal-year { font-size: 1.1rem; font-weight: 800; color: white; }
          .footer-contact { font-size: 0.8rem; color: #94a3b8; }
          @media print {
            body { padding: 0; background: white; }
            .carnet-card { border-radius: 0; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="carnet-card">
          <div class="carnet-header">
            <div class="club-badge">
              <div class="badge-icon">
                <img src="${window.location.origin}/assets/Fondo Club.png" alt="Escudo">
              </div>
              <div class="badge-text">
                <h2>CLUB SOCIAL Y DEPORTIVO</h2>
                <h3>VILLA MANZANO</h3>
              </div>
            </div>
            <span class="type-badge">SOCIO ACTIVO</span>
          </div>
          <div class="carnet-body">
            <div class="avatar-iniciales-large">${this.getIniciales()}</div>
            <div style="flex:1">
              <h3 class="socio-name">${this.getNombreCompleto()}</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">N° DE SOCIO</span>
                  <span class="info-value">${this.currentUser?.numero_socio}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">DNI</span>
                  <span class="info-value">${this.currentUser?.dni}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">AFILIACIÓN</span>
                  <span class="info-value">${this.getFechaAfiliacion()}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">VENCIMIENTO</span>
                  <span class="info-value">${this.getFechaVencimiento()}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="carnet-footer">
            <div>
              <div class="seal-text">VÁLIDO</div>
              <div class="seal-year">${this.currentYear}</div>
            </div>
            <div class="footer-contact">clubfootballvm.netlify.app</div>
          </div>
        </div>
        <script>
          window.onload = () => { window.print(); window.onafterprint = () => window.close(); }
        </script>
      </body>
    </html>
  `);
  ventana.document.close();
}

descargarCarnet(): void {
  this.imprimirCarnet();
}

}