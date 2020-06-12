import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from "moment";
import { CalendarComponentOptions } from 'ion2-calendar';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-choose-date',
  templateUrl: './choose-date.component.html',
  styleUrls: ['./choose-date.component.scss'],
})
export class ChooseDateComponent implements OnInit {
  @Input() patient: any
  @Input() therapist: any
  appointmentDate: moment.Moment = moment().add('day', 1).startOf('day').add('hours', 10)
  appointmentDateStr: string = this.appointmentDate.toISOString()
  appointmentDateDate: Date = this.appointmentDate.toDate()
  calendarOptions: CalendarComponentOptions = {}
  type: string = 'js-date'
  today: string = moment().toISOString()
  todayToFifth: moment.Moment = moment().add('M', 5)
  todayToFifthStr: string = this.todayToFifth.toISOString()
  todayToFifthDate: Date = this.todayToFifth.toDate()
  appointment: any = {
    start_time: '',
    end_time: '',
    userId: null,
    date: null
  }
  constructor(
    private modalCtrl: ModalController,
    private api: ApiService
  ) {
    /*

/:id es el del paciente
en el body mandas un therapistId
que es el del terapeuta
solo se les permite asignar a administradores y soporte
para appointments/
le vas aaa
Mandar asi al post
  userId:number; patientId
  date:string; "2020-06-12"
  start_time:string; "18:00"
  end_time: string; "19:00"
    */
  }

  ngOnInit() {
    this.calendarOptions.to = this.todayToFifthDate
    this.appointment.userId = '' + this.patient.id
    console.log(this.patient);
    this.selectTime()
  }

  public closeTerms() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  public selectIonDate() {
    this.appointmentDateDate = moment(this.appointmentDateStr).toDate()
  }

  public selectTime() {
    this.appointmentDateDate = moment(this.appointmentDateStr).toDate()
    let appointmentDate = moment(this.appointmentDateDate).clone()
    this.appointment.start_time = appointmentDate.format('HH:mm')
    this.appointment.end_time = appointmentDate.add('hour', 1).format('HH:mm')
  }

  public selectCalendarDay() {
    this.appointmentDateStr = moment(this.appointmentDateDate).toISOString()
  }

  private async createAppointment() {
    this.appointment.date = this.appointmentDateStr
    const newAppointment = await this.api.createAppointment(this.appointment)
    console.log(newAppointment);

  }

}
