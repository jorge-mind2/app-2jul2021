import { Component, OnInit, Input } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/api-services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-next-appointment',
  templateUrl: './next-appointment.component.html',
  styleUrls: ['./next-appointment.component.scss'],
})
export class NextAppointmentComponent implements OnInit {
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
  hoursAvailability: any[] = []
  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
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
    this.calendarOptions.daysConfig = this.patient.appointments.map(appointment => {
      return {
        date: moment(appointment.date).toDate(),
        marked: true,
        disable: true,
        subTitle: appointment.start_time.substring(0, 5),
        cssClass: 'scheduled',
      }
    })
    this.calendarOptions.disableWeeks = [0, 1, 2, 3, 4, 5, 6, 7].reduce<number[]>((acc, val): number[] => {
      if (!this.therapist.availability.some(s => s.day == val)) return acc.concat(val)
      return acc
    }, [])
  }

  public closeModal() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  public selectTime(selectedHour): void {
    this.hoursAvailability = this.hoursAvailability.map(hour => Object.assign(hour, { color: hour.start_time == selectedHour.start_time ? 'success' : 'tertiary', selected: hour.start_time == selectedHour.start_time }))
    this.appointment.start_time = `${selectedHour.start_time}:00`
    this.appointment.end_time = `${selectedHour.end_time}:00`
  }

  public selectCalendarDay(selectedDate: Date): void {
    this.appointment.date = selectedDate.toISOString()
    let hours = this.therapist.availability.find(s => s.day == selectedDate.getDay()).hours
    let schedulesOfDay = this.therapist.appointments.filter(a => moment(selectedDate).isSame(a.date, 'date'))
    this.hoursAvailability = hours.map(hour => {
      const available = !schedulesOfDay.some(a => +a.start_time.split(':')[0] == hour.start_time)
      const appointment = schedulesOfDay.find(a => a.start_time.split(':')[0] == hour.start_time)
      const color = available ? 'tertiary' : 'medium'
      return { ...hour, available, appointment, color }
    }).sort((a, b) => a.start_time - b.start_time)
  }

  public async createAppointment() {
    try {
      // this.appointment.date = moment(this.appointmentDateStr).format('YYYY-MM-DD')
      // return console.log(this.appointment)
      const newAppointment = await this.api.createAppointment(this.appointment)
      console.log(newAppointment);
      // this.presentToast('Cita guardada')
      this.presentToast('Cita guardada').finally(() => this.closeModal())

    } catch (error) {
      console.log(error);

    }

  }


  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
