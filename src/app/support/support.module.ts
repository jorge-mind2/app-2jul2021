import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SupportPage } from './support.page';

import { CalendarModule } from 'ion2-calendar'

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
    RouterModule.forChild(routes)
  ],
  declarations: [SupportPage]
})
export class SupportPageModule { }
