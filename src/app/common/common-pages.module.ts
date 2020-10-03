import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NextAppointmentComponent } from './next-appointment/next-appointment.component';
import { CalendarModule } from 'ion2-calendar';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { TwilioCallComponent } from './twilio-call/twilio-call.component';
import { ChatComponent } from './chat/chat.component';

@NgModule({
  declarations: [
    NextAppointmentComponent,
    TwilioCallComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    CalendarModule,
  ],
  exports: [
    ChatComponent
  ]
})
export class CommonPagesModule { }
