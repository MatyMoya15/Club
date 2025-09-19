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
    NavbarAfComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
