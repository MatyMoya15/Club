import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NoticiaComponent } from './components/noticia/noticia.component';
import { DeportesComponent } from './components/deportes/deportes.component';
import { SociosInfoComponent } from './components/socios-info/socios-info.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { ComisionComponent } from './components/comision/comision.component';
import { HistoriaComponent } from './components/historia/historia.component';
import { FaqComponent } from './components/faq/faq.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/access _fan/login/login.component';
import { RegisterComponent } from './components/access _fan/register/register.component';
import { ProfileComponent } from './components/access _fan/profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarAfComponent } from './components/access _fan/navbar-af/navbar-af.component';
import { SocioComponent } from './components/access _fan/socio/socio.component';
import { PerfilComponent } from './components/access _fan/socio/perfil/perfil.component';
import { AdminComponent } from './components/access _fan/socio/admin/admin.component';
import { CuotasComponent } from './components/access _fan/socio/cuotas/cuotas.component';
import { CarnetComponent } from './components/access _fan/socio/carnet/carnet.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthService } from './service/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AdminNoticiasComponent } from './components/access _fan/socio/admin/admin-noticias/admin-noticias.component';
import { AdminSociosComponent } from './components/access _fan/socio/admin/admin-socios/admin-socios.component';
import { AdminCuotasComponent } from './components/access _fan/socio/admin/admin-cuotas/admin-cuotas.component';
import { FooterAfComponent } from './components/access _fan/footer-af/footer-af.component';
import { Nl2brPipe } from './pipes/nl2br.pipe';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NoticiaComponent,
    DeportesComponent,
    SociosInfoComponent,
    ContactoComponent,
    ComisionComponent,
    HistoriaComponent,
    FaqComponent,
    NavbarComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    NavbarAfComponent,
    SocioComponent,
    PerfilComponent,
    CuotasComponent,
    CarnetComponent, 
    AdminComponent, AdminNoticiasComponent, AdminSociosComponent, AdminCuotasComponent, FooterAfComponent,
    Nl2brPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    AdminGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }