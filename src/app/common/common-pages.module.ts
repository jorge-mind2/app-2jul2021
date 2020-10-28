import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NextAppointmentComponent } from './next-appointment/next-appointment.component';
import { CalendarModule } from 'ion2-calendar';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';

@NgModule({
  declarations: [
    NextAppointmentComponent,
    ChatComponent,
    VideoCallComponent,
    ViewProfileComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    CalendarModule,
  ],
  exports: [
    ChatComponent,
    VideoCallComponent,
    ViewProfileComponent
  ]
})
export class CommonPagesModule { }
