import { Component, OnInit, Input } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { ApiService } from 'src/app/api-services/api.service';
import * as moment from 'moment';
import { AuthService } from 'src/app/api-services/auth.service';

@Component({
  selector: 'app-next-appointment',
  templateUrl: './next-appointment.component.html',
  styleUrls: ['./next-appointment.component.scss'],
})
export class NextAppointmentComponent implements OnInit {
  @Input() patient: any
  @Input() therapist: any
  @Input() onlySchedule: any
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
  therapistAvailable: boolean = false
  view: string = 'schedule'
  groupedAppointments: any[]
  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private auth: AuthService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.therapistAvailable = this.therapist.availability.length
    this.calendarOptions.to = this.todayToFifthDate
    if (this.onlySchedule) {
      this.view = 'appointments'
      return this.getMyAppointments()
    }
    this.appointment.userId = '' + this.patient.id
    this.calendarOptions.daysConfig = this.patient.appointments.map(appointment => {
      return {
        date: moment(appointment.date).toDate(),
        marked: true,
        disable: true,
        subTitle: appointment.start_time.substring(0, 5),
        cssClass: 'scheduled',
      }
    })
    console.log('patient', this.patient);
    console.log('therapist', this.therapist);
    this.getMyAppointments()
    var daysArray: number[] = [0, 1, 2, 3, 4, 5, 6, 7]
    this.calendarOptions.disableWeeks = this.therapistAvailable ?
      daysArray.reduce<number[]>((acc, val): number[] => {
        if (!this.therapist.availability.some(s => s.day == val)) return acc.concat(val)
        return acc
      }, []) :
      daysArray
  }

  public setView(e) {
    this.view = e.detail.value
  }

  public closeModal(updated: boolean = false) {
    this.modalCtrl.dismiss({
      'dismissed': true,
      updated
    });
  }

  public async getMyAppointments() {
    const appointments = await this.api.getUserAppointments(await this.auth.getCurrentId())
    console.log('appointments', appointments.data);
    const currentUserId = await this.auth.getCurrentId()
    this.groupedAppointments = appointments.data.map(a => {
      a.order = a.group == 'today' ? 0 : a.group == 'next' ? 1 : 2
      a.name = a.group == 'today' ? 'Hoy' : a.group == 'next' ? 'Próximas' : 'Pasadas'
      a.appointments = a.appointments.map(A => {
        A.user = A.users.find(u => u.id !== currentUserId)
        return A
      })
      return a
    }).sort((a, b) => a.order - b.order)
    console.log('this.groupedAppointments', this.groupedAppointments);

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
      this.presentToast('Cita guardada').finally(() => this.closeModal(true))

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
