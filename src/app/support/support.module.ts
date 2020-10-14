import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SupportPage } from './support.page';

import { CalendarModule } from 'ion2-calendar'
import { CommonPagesModule } from '../common/common-pages.module';

const routes: Routes = [
  {
    path: '',
    component: SupportPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarModule,
    CommonPagesModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SupportPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SupportPageModule { }
