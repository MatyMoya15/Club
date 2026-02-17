import { Component, OnInit } from '@angular/core';

interface Pago {
  id: number;
  mes: string;
  anio: number;
  monto: number;
  fechaPago: Date | null;
  estado: 'pagado' | 'pendiente' | 'vencido';
  metodoPago?: string;
}

interface EstadoCuenta {
  totalPagado: number;
  totalDeuda: number;
  cuotasAlDia: boolean;
  proximoVencimiento: Date | null;
}

@Component({
  selector: 'app-cuotas',
  templateUrl: './cuotas.component.html',
  styleUrls: ['./cuotas.component.css']
})
export class CuotasComponent implements OnInit {
  
  estadoCuenta: EstadoCuenta = {
    totalPagado: 0,
    totalDeuda: 0,
    cuotasAlDia: true,
    proximoVencimiento: null
  };

  historialPagos: Pago[] = [];
  montoCuota: number = 5000; // Monto mensual de la cuota
  
  // Datos de ejemplo - En producción vendrían de un servicio
  ngOnInit() {
    this.cargarDatosEjemplo();
    this.calcularEstadoCuenta();
  }

  cargarDatosEjemplo() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'];
    
    this.historialPagos = [
      { id: 1, mes: 'Enero', anio: 2025, monto: 5000, fechaPago: new Date('2025-01-15'), estado: 'pagado', metodoPago: 'Efectivo' },
      { id: 2, mes: 'Febrero', anio: 2025, monto: 5000, fechaPago: new Date('2025-02-10'), estado: 'pagado', metodoPago: 'Transferencia' },
      { id: 3, mes: 'Marzo', anio: 2025, monto: 5000, fechaPago: new Date('2025-03-12'), estado: 'pagado', metodoPago: 'Efectivo' },
      { id: 4, mes: 'Abril', anio: 2025, monto: 5000, fechaPago: new Date('2025-04-08'), estado: 'pagado', metodoPago: 'Transferencia' },
      { id: 5, mes: 'Mayo', anio: 2025, monto: 5000, fechaPago: new Date('2025-05-20'), estado: 'pagado', metodoPago: 'Efectivo' },
      { id: 6, mes: 'Junio', anio: 2025, monto: 5000, fechaPago: null, estado: 'vencido', metodoPago: undefined },
      { id: 7, mes: 'Julio', anio: 2025, monto: 5000, fechaPago: null, estado: 'vencido', metodoPago: undefined },
      { id: 8, mes: 'Agosto', anio: 2025, monto: 5000, fechaPago: null, estado: 'pendiente', metodoPago: undefined },
      { id: 9, mes: 'Septiembre', anio: 2025, monto: 5000, fechaPago: null, estado: 'pendiente', metodoPago: undefined }
    ];
  }

  calcularEstadoCuenta() {
    this.estadoCuenta.totalPagado = this.historialPagos
      .filter(p => p.estado === 'pagado')
      .reduce((sum, p) => sum + p.monto, 0);
    
    this.estadoCuenta.totalDeuda = this.historialPagos
      .filter(p => p.estado === 'vencido' || p.estado === 'pendiente')
      .reduce((sum, p) => sum + p.monto, 0);
    
    this.estadoCuenta.cuotasAlDia = this.historialPagos
      .filter(p => p.estado === 'vencido').length === 0;
    
    const proximaPendiente = this.historialPagos
      .find(p => p.estado === 'pendiente' || p.estado === 'vencido');
    
    if (proximaPendiente) {
      this.estadoCuenta.proximoVencimiento = new Date(proximaPendiente.anio, this.obtenerNumeroMes(proximaPendiente.mes), 10);
    }
  }

  obtenerNumeroMes(nombreMes: string): number {
    const meses: { [key: string]: number } = {
      'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
      'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
    };
    return meses[nombreMes] || 0;
  }

  getEstadoBadgeClass(estado: string): string {
    switch(estado) {
      case 'pagado': return 'bg-success';
      case 'pendiente': return 'bg-warning';
      case 'vencido': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  descargarComprobante(pago: Pago) {
    // Implementar lógica para descargar comprobante
    console.log('Descargando comprobante para:', pago);
    alert(`Descargando comprobante de ${pago.mes} ${pago.anio}`);
  }

  pagarCuota(pago: Pago){

  }
}