import { Component, OnInit, Input } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';
import { ModalController, ToastController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/api-services/api.service';
import * as moment from 'moment';
import { AuthService } from 'src/app/api-services/auth.service';
import { StorageService } from 'src/app/api-services/storage.service';

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
  today: any = new Date().toString()
  appointment: any = {
    start_time: '',
    end_time: '',
    real_end_time: '',
    userId: null,
    date: null
  }
  hoursAvailability: any[] = []
  therapistAvailable: boolean = false
  view: 'schedule' | 'appointments'
  groupedAppointments: any[]
  packageAvailability: any = {
    count_appointment: null,
    package_name: "",
    package_product_quantity: null,
    availability: 0
  }
  moment = moment
  loginType: string
  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private storage: StorageService,
    private auth: AuthService,
    private api: ApiService
  ) { }

  async ngOnInit() {
    await this.getMyAppointments()
    if (this.onlySchedule) {
      this.view = 'appointments'
      return
    }
    this.loginType = await this.storage.getUserType()
    this.therapistAvailable = this.therapist.availability.length
    this.appointment.userId = '' + this.patient.id
    console.log('patient', this.patient);
    console.log('therapist', this.therapist);
    this.prepareCalendar()
    this.view = 'schedule'
    this.api.getPackagesAvailability(this.patient.id).then(response => {
      // console.log('getPackasAvailability', response)
      if (response.data) {
        this.packageAvailability = response.data
        this.packageAvailability.availability = +response.data.package_product_quantity - +response.data.count_appointment
      }
    })

  }

  goToPlans() {
    // this.navCtrl.navigateForward('plans').finally(async () => this.modalCtrl.dismiss({}))
    this.modalCtrl.dismiss({}).finally(async () => this.navCtrl.navigateForward('plans'))
  }

  private prepareCalendar() {
    this.calendarOptions.to = moment().add('M', 5).toDate()
    const daysArray: number[] = [0, 1, 2, 3, 4, 5, 6, 7]
    this.calendarOptions.daysConfig = this.patient.appointments.map(appointment => {
      return {
        date: moment(appointment.date).toDate(),
        marked: true,
        disable: true,
        subTitle: appointment.start_time.substring(0, 5),
        cssClass: 'scheduled',
      }
    })
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

  public async closeModal(updated: boolean = false) {
    this.modalCtrl.dismiss({
      'dismissed': true,
      updated
    }).finally(async () => {
      if (await this.loadingCtrl.getTop()) await this.loadingCtrl.dismiss()
    });
  }

  public async getMyAppointments() {
    const appointments = await this.api.getUserAppointments(await this.auth.getCurrentId())
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
  }

  public selectTime(selectedHour): void {
    this.hoursAvailability = this.hoursAvailability.map(hour => Object.assign(hour, { color: hour.start_time == selectedHour.start_time ? 'success' : 'tertiary', selected: hour.start_time == selectedHour.start_time }))
    this.appointment.start_time = `${selectedHour.start_time}:00`
    this.appointment.end_time = `${selectedHour.end_time}:00`
    this.appointment.real_end_time = `${selectedHour.start_time}:50`
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
    const todayMexico = new Date().toLocaleString('es-MX')
    const isSameDay = moment(selectedDate).isSame(todayMexico, 'date')
    if (isSameDay) {
      const currentTime = moment(todayMexico).format('HH')
      const offsetHours = 2
      this.hoursAvailability = this.hoursAvailability.filter(hour => {
        return hour.start_time + offsetHours >= +currentTime
      })
    }
  }

  public async createAppointment() {
    await this.presentLoading()
    try {
      // this.appointment.date = moment(this.appointmentDateStr).format('YYYY-MM-DD')
      // return console.log(this.appointment)
      const newAppointment = await this.api.createAppointment(this.appointment)
      console.log(newAppointment);
      this.patient.appointments.push(newAppointment.data)
      if (this.patient.id == await this.auth.getCurrentId()) {
        await this.storage.updateCurrentUser(this.patient)
      }
      // this.presentToast('Cita guardada')
      this.presentToast('Cita guardada').finally(() => this.closeModal(true))

    } catch (error) {
      console.log(error);
      this.loadingCtrl.dismiss()
    }

  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message: 'Guardando...'
    })
    await loading.present();
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
