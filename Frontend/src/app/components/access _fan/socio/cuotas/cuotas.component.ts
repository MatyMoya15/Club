import { Component, OnInit } from '@angular/core';
import { CuotaService, Cuota } from 'src/app/service/cuota.service';
import { AuthService } from 'src/app/service/auth.service';

interface EstadoCuenta
{
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
export class CuotasComponent implements OnInit
{

  estadoCuenta: EstadoCuenta = {
    totalPagado: 0,
    totalDeuda: 0,
    cuotasAlDia: true,
    proximoVencimiento: null
  };

  anioSeleccionado: number = new Date().getFullYear();
  aniosDisponibles: number[] = [new Date().getFullYear()];

  // Todas las cuotas del socio (sin filtrar); historialPagos es la vista del año elegido
  private todasLasCuotas: Cuota[] = [];
  historialPagos: Cuota[] = [];

  montoCuota: number = 8000;
  isLoading: boolean = true;
  error: string = '';

  showPagoModal: boolean = false;
  cuotaAPagar: Cuota | null = null;
  metodoPago: 'transferencia' | 'mercadopago' | null = null;
  isProcessingPago: boolean = false;
  pagoError: string = '';

  constructor(
    private cuotaService: CuotaService,
    private authService: AuthService
  ) { }

  ngOnInit(): void
  {
    this.cargarCuotas();
  }

  cargarCuotas(): void
  {
    this.isLoading = true;
    this.error = '';

    const user = this.authService.currentUserValue;
    if (!user)
    {
      this.error = 'No se pudo obtener el usuario';
      this.isLoading = false;
      return;
    }

    this.cuotaService.getCuotasBySocio(user.id_socio).subscribe({
      next: (cuotas) =>
      {
        this.todasLasCuotas = cuotas;
        this.actualizarAniosDisponibles();
        this.aplicarAnio();
        this.isLoading = false;
      },
      error: () =>
      {
        this.error = 'Error al cargar las cuotas';
        this.isLoading = false;
      }
    });
  }

  // Años según las cuotas reales del socio (más nuevo primero).
  // Si el año elegido no existe, usa el año actual, o el más reciente que haya.
  private actualizarAniosDisponibles(): void
  {
    const anioActual = new Date().getFullYear();
    const anios = Array.from(new Set(this.todasLasCuotas.map(c => Number(c.anio))))
      .sort((a, b) => b - a);

    this.aniosDisponibles = anios.length > 0 ? anios : [anioActual];

    if (!this.aniosDisponibles.includes(this.anioSeleccionado))
    {
      this.anioSeleccionado = this.aniosDisponibles.includes(anioActual)
        ? anioActual
        : this.aniosDisponibles[0];
    }
  }

  // Filtra en memoria: cambiar de año ya no vuelve a llamar al servidor
  private aplicarAnio(): void
  {
    this.historialPagos = this.todasLasCuotas
      .filter(c => Number(c.anio) === this.anioSeleccionado)
      .sort((a, b) => a.mes - b.mes);
    this.calcularEstadoCuenta();
  }

  cambiarAnio(anio: number | string): void
  {
    this.anioSeleccionado = Number(anio);
    this.aplicarAnio();
  }

  getNombreMes(mes: number): string
  {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
  }

  descargarComprobante(cuota: Cuota): void
  {
    alert(`Comprobante: ${cuota.comprobante || 'No disponible'}`);
  }

  pagarCuota(cuota: Cuota): void
  {
    this.cuotaAPagar = cuota;
    this.metodoPago = null;
    this.pagoError = '';
    this.showPagoModal = true;
  }

  cerrarPagoModal(): void
  {
    if (this.isProcessingPago) return;
    this.showPagoModal = false;
    this.cuotaAPagar = null;
    this.metodoPago = null;
    this.pagoError = '';
  }

  confirmarPagoMercadoPago(): void
  {
    if (!this.cuotaAPagar) return;
    this.isProcessingPago = true;
    this.pagoError = '';

    this.cuotaService.crearPreferenciaMercadoPago(this.cuotaAPagar.id_cuota).subscribe({
      next: (response) =>
      {
        this.isProcessingPago = false;
        window.location.href = response.init_point;
      },
      error: (err) =>
      {
        this.isProcessingPago = false;
        this.pagoError = err.error?.error || 'Error al conectar con MercadoPago';
      }
    });
  }

  calcularEstadoCuenta(): void
  {
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    this.estadoCuenta.totalPagado = this.historialPagos
      .filter(p => p.estado === 'pagada')
      .reduce((sum, p) => sum + Number(p.monto), 0);

    this.estadoCuenta.totalDeuda = this.historialPagos
      .filter(p => p.estado === 'vencida' || p.estado === 'pendiente')
      .reduce((sum, p) => sum + Number(p.monto), 0);

    const tieneDeudaVencida = this.historialPagos.some(p =>
    {
      if (p.estado === 'pagada') return false;

      const esMesPasado =
        p.anio < anioActual ||
        (p.anio === anioActual && p.mes < mesActual);

      return esMesPasado;
    });

    this.estadoCuenta.cuotasAlDia = !tieneDeudaVencida;

    const proxima = this.historialPagos
      .find(p => p.estado === 'pendiente' || p.estado === 'vencida');

    this.estadoCuenta.proximoVencimiento = proxima
      ? new Date(proxima.anio, proxima.mes - 1, 10)
      : null;
  }
}