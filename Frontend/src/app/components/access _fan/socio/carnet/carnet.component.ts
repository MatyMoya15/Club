// carnet.component.ts
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-carnet',
  templateUrl: './carnet.component.html',
  styleUrls: ['./carnet.component.css']
})
export class CarnetComponent implements OnInit {
  
  socioData = {
    nombreCompleto: 'Diego Armando',
    numeroSocio: 'VM2024001',
    dni: '35.000.000',
    fechaAfiliacion: '15/03/2020',
    estaActivo: true
  };

  currentYear: number = new Date().getFullYear();

  ngOnInit() {
    // Aquí cargarías los datos reales del socio
  }

  getIniciales(): string {
    if (!this.socioData.nombreCompleto) return 'US';
    
    const nombres = this.socioData.nombreCompleto.split(' ');
    if (nombres.length >= 2) {
      return (nombres[0].charAt(0) + nombres[nombres.length - 1].charAt(0)).toUpperCase();
    } else if (nombres.length === 1) {
      return nombres[0].substring(0, 2).toUpperCase();
    }
    
    return 'US';
  }

  getFechaVencimiento(): string {
    // Lógica para calcular fecha de vencimiento (ej: fin de año actual)
    return `31/12/${this.currentYear}`;
  }

  descargarCarnet(): void {
    console.log('Descargando carnet...');
    // Lógica para descargar el carnet como PDF/imagen
  }

  compartirCarnet(): void {
    console.log('Compartiendo carnet...');
    // Lógica para compartir el carnet
  }

  imprimirCarnet(): void {
    console.log('Imprimiendo carnet...');
    window.print();
  }

  verificarCarnet(): void {
    console.log('Verificando carnet...');
    // Lógica para verificar validez del carnet
  }
}