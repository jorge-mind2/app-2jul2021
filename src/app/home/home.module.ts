import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { MenuComponentModule } from '../menu/menu.module';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';
import { CommonPagesModule } from '../common/common-pages.module';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MenuComponentModule,
    CommonPagesModule,
    RouterModule.forChild(routes)
  ],
  entryComponents: [NextAppointmentComponent],
  declarations: [HomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePageModule { }
