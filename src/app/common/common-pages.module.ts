import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NextAppointmentComponent } from './next-appointment/next-appointment.component';
import { CalendarModule } from 'ion2-calendar';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { VideoCallComponent } from './video-call/video-call.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { QuickstartComponent } from './quickstart/quickstart.component';
import { CardComponent } from './card/card.component';

@NgModule({
  declarations: [
    NextAppointmentComponent,
    ChatComponent,
    VideoCallComponent,
    ViewProfileComponent,
    QuickstartComponent,
    CardComponent
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
    ViewProfileComponent,
    QuickstartComponent,
    CardComponent
  ]
})
export class CommonPagesModule { }
