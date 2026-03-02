import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Cuota
{
  id_cuota: number;
  id_socio: number;
  anio: number;
  mes: number;
  monto: number;
  vencimiento: string;
  estado: 'pendiente' | 'pagada' | 'vencida';
  fecha_creacion: string;
  // Del join con pago
  fecha_pago?: string;
  metodo_pago?: string;
  monto_pagado?: number;
  comprobante?: string;
  total_pagado?: number;
}

export interface PagarCuotaRequest
{
  metodo: 'efectivo' | 'transferencia' | 'tarjeta' | 'mercadopago';
  monto: number;
  comprobante?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CuotaService
{
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCuotasBySocio(idSocio: number): Observable<Cuota[]>
  {
    return this.http.get<Cuota[]>(`${this.apiUrl}/cuotas/socio/${idSocio}`);
  }

  pagarCuota(idCuota: number, data: PagarCuotaRequest): Observable<any>
  {
    return this.http.post(`${environment.apiUrl}/pagos`, {
      id_cuota: idCuota,
      metodo: data.metodo,
      monto: data.monto,
      comprobante: data.comprobante || undefined
    });
  }

  crearPreferenciaMercadoPago(cuotaId: number): Observable<{ id: string, init_point: string, sandbox_init_point: string }>
  {
    return this.http.post<any>(`${environment.apiUrl}/mercadopago/create-preference`, {
      cuota_id: cuotaId
    });
  }
}