import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomeTherapistPage } from './home-therapist.page';
import { MenuComponentModule } from '../menu/menu.module';

const routes: Routes = [
  {
    path: '',
    component: HomeTherapistPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuComponentModule,
    RouterModule.forChild(routes)
  ],
  declarations: [HomeTherapistPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeTherapistPageModule { }
