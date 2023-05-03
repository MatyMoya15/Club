import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ComisionComponent } from './components/comision/comision.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { DeportesComponent } from './components/deportes/deportes.component';
import { FaqComponent } from './components/faq/faq.component';
import { HistoriaComponent } from './components/historia/historia.component';
import { NoticiaComponent } from './components/noticia/noticia.component';
import { SociosInfoComponent } from './components/socios-info/socios-info.component';

const routes: Routes = [
  {
    path:'', component: HomeComponent
  },
  {
    path:'comision', component: ComisionComponent
  },
  {
    path:'contacto', component: ContactoComponent
  },
  {
    path:'deportes', component: DeportesComponent
  },
  {
    path:'faq', component: FaqComponent
  },
  {
    path:'historia', component: HistoriaComponent
  },
  {
    path:'noticia', component: NoticiaComponent
  },
  {
    path:'socio-info', component: SociosInfoComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
