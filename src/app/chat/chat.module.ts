import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChatPage } from './chat.page';
import { CalendarModule } from 'ion2-calendar';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';
import { CommonPagesModule } from '../common/common-pages.module';
import { OptionsComponent } from './options/options.component';

const routes: Routes = [
  {
    path: '',
    component: ChatPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CalendarModule,
    RouterModule.forChild(routes),
    CommonPagesModule
  ],
  entryComponents: [
    NextAppointmentComponent,
    OptionsComponent,
  ],
  declarations: [
    ChatPage,
    OptionsComponent
  ]
})
export class ChatPageModule { }
