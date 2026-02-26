// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { HomeComponent } from './components/home/home.component';
import { ComisionComponent } from './components/comision/comision.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { DeportesComponent } from './components/deportes/deportes.component';
import { FaqComponent } from './components/faq/faq.component';
import { HistoriaComponent } from './components/historia/historia.component';
import { NoticiaComponent } from './components/noticia/noticia.component';
import { SociosInfoComponent } from './components/socios-info/socios-info.component';

// Access Fan Components
import { LoginComponent } from './components/access _fan/login/login.component';
import { RegisterComponent } from './components/access _fan/register/register.component';
import { PerfilComponent } from './components/access _fan/socio/perfil/perfil.component';
import { SocioComponent } from './components/access _fan/socio/socio.component';
import { CuotasComponent } from './components/access _fan/socio/cuotas/cuotas.component';
import { CarnetComponent } from './components/access _fan/socio/carnet/carnet.component';

// Admin Components - Separados
import { AdminNoticiasComponent } from './components/access _fan/socio/admin/admin-noticias/admin-noticias.component';
import { AdminSociosComponent } from './components/access _fan/socio/admin/admin-socios/admin-socios.component';
import { AdminDeportesComponent } from './components/access _fan/socio/admin/admin-deportes/admin-deportes.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  // Rutas públicas
  { path: '', component: HomeComponent },
  { path: 'comision', component: ComisionComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'deportes', component: DeportesComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'historia', component: HistoriaComponent },
  { path: 'noticia/:id', component: NoticiaComponent }, // ⬅️ CAMBIADO
  { path: 'info-socios', component: SociosInfoComponent },
  
  // Rutas de autenticación
  { path: 'access-fan', component: LoginComponent },
  { path: 'asociarme', component: RegisterComponent },
  
  // Rutas del socio (protegidas)
  {
    path: 'socio', 
    component: SocioComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'perfil',
        pathMatch: 'full'
      },
      {
        path: 'perfil', 
        component: PerfilComponent
      },
      {
        path: 'cuotas', 
        component: CuotasComponent
      },
      {
        path: 'carnet', 
        component: CarnetComponent
      },
      // ✅ Rutas de administración - separadas y protegidas
      {
        path: 'admin/noticias', 
        component: AdminNoticiasComponent,
        // canActivate: [AdminGuard] 
      },
      {
        path: 'admin/socios', 
        component: AdminSociosComponent,
        // canActivate: [AdminGuard] 
      },
      {
        path: 'admin/cuotas', 
        component: AdminDeportesComponent,
        // canActivate: [AdminGuard] 
      }
    ]
  },
  
  // Ruta 404
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }