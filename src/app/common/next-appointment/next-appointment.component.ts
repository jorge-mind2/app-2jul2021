import { Component, OnInit, Input } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';
import { ModalController, ToastController, AlertController, LoadingController, NavController } from '@ionic/angular';
import { ApiService } from 'src/app/api-services/api.service';
import * as moment from 'moment';
import { AuthService } from 'src/app/api-services/auth.service';
import { StorageService } from 'src/app/api-services/storage.service';
import { AppointmentStatus } from 'src/app/common/constants.enum'

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
  calendarOptions: CalendarComponentOptions = {
    weekdays: "Do_Lu_Ma_Mi_Ju_Vi_Sa".split("_"),

  }
  type: string = 'js-date'
  today: any = new Date().toString()
  existingAppointment: any = null
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
    availability: null
  }
  moment = moment
  loginType: string
  appointmentsUpdated: boolean = false
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
    this.prepareCalendar()
    this.view = 'schedule'
    this.api.getPackagesAvailability(this.patient.id).then(response => {
      if (response.data) {
        this.packageAvailability = response.data
        this.packageAvailability.availability = +response.data.package_product_quantity - +response.data.count_appointment
      } else {
        this.packageAvailability.availability = 0
      }
    })

  }

  goToPlans() {
    // this.navCtrl.navigateForward('plans').finally(async () => this.modalCtrl.dismiss({}))
    this.modalCtrl.dismiss({}).finally(async () => this.navCtrl.navigateForward('plans'))
  }

  private prepareCalendar() {
    this.calendarOptions.to = moment().add('week', 4).toDate()
    const daysArray: number[] = [0, 1, 2, 3, 4, 5, 6, 7]
    this.calendarOptions.daysConfig = []
    this.calendarOptions.daysConfig = this.patient.appointments.filter(appointment => [AppointmentStatus.ENABLED, AppointmentStatus.FINISHED].includes(appointment.status)).map(appointment => {
      return {
        date: moment(appointment.date).toDate(),
        marked: true,
        disable: moment(appointment.date).isBefore(moment(new Date().toLocaleDateString('es-mx'), 'DD/MM/YYYY'), 'date'),
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
    const todayMexico = moment(new Date().toLocaleString('es-MX'), 'DD/MM/YYYY HH:mm:ss')
    this.groupedAppointments = appointments.data.map(a => {
      a.order = a.group == 'today' ? 0 : a.group == 'next' ? 1 : 2
      a.name = a.group == 'today' ? 'Hoy' : a.group == 'next' ? 'Próximas' : 'Pasadas'
      a.appointments = a.appointments.map(A => {
        const appointmentDate = moment(`${A.date} ${A.start_time}`)
        A.cancellable = todayMexico.isBefore(appointmentDate)
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
    const exisitingPatientAppointment = this.patient.appointments.find(appointment => moment(selectedDate).isSame(appointment.date, 'date'))
    if (exisitingPatientAppointment) {
      this.hoursAvailability = []
      this.existingAppointment = {
        date: moment(exisitingPatientAppointment.date).format('DD [de] MMMM [de] YYYY'),
        start_time: exisitingPatientAppointment.start_time.substring(0, 5),
        id: exisitingPatientAppointment.id
      }
    } else {
      this.existingAppointment = null
      this.appointment.date = selectedDate.toISOString()
      let hours = this.therapist.availability.find(s => s.day == selectedDate.getDay()).hours
      let schedulesOfDay = this.therapist.appointments.filter(a => moment(selectedDate).isSame(a.date, 'date') && [AppointmentStatus.ENABLED].includes(a.status))
      this.hoursAvailability = hours.sort((a, b) => a.start_time - b.start_time).reduce((currentValue, newItem) => currentValue.length && currentValue[currentValue.length - 1].start_time == newItem.start_time ? currentValue : [...currentValue, newItem], []).map(hour => {
        const available = !schedulesOfDay.some(a => +a.start_time.split(':')[0] == hour.start_time)
        const appointment = schedulesOfDay.find(a => a.start_time.split(':')[0] == hour.start_time)
        const color = available ? 'tertiary' : 'medium'
        return { ...hour, available, appointment, color }
      })

      const todayMexico = new Date().toLocaleString('es-MX')
      const isSameDay = moment(selectedDate).isSame(moment(todayMexico, 'DD/MM/YYYY'), 'date')

      if (isSameDay) {
        const currentTime = moment(todayMexico, 'DD/MM/YYYY HH:mm:ss').format('HH')
        const offsetHours = 2
        /* this.hoursAvailability = this.hoursAvailability.filter(hour => {
          return +currentTime + offsetHours < hour.start_time
        }) */
        this.hoursAvailability = this.hoursAvailability.map(hour => ({
          ...hour,
          available: +currentTime + offsetHours >= hour.start_time ? false : hour.available,
          color: +currentTime + offsetHours >= hour.start_time ? 'medium' : hour.color,
        }))
      }
    }
  }

  public async createAppointment() {
    await this.presentLoading()
    try {
      // this.appointment.date = moment(this.appointmentDateStr).format('YYYY-MM-DD')
      // return consol
      const newAppointment = await this.api.createAppointment(this.appointment)
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

  async alertCancelAppointment(appointmentToCancel, fromList: boolean = false) {
    const alert = await this.alertCtrl.create({
      header: 'Cancelar cita',
      message: '¿Aceptas cancelar esta cita?',
      backdropDismiss: false,
      buttons: [{
        text: 'Sí, cancelar',
        cssClass: 'text-secondary',
        handler: () => this.cancelAppointment(+appointmentToCancel.id, fromList).then(() => appointmentToCancel.status = AppointmentStatus.CANCELED)
      }, {
        text: 'No, dejar en la agenda',
        cssClass: 'primary'
      }]
    })

    alert.present();
  }

  async cancelAppointment(id: number, fromList: boolean = false): Promise<void> {
    this.presentLoading('Cancelando cita...')
    try {
      const appointmentCanceled: any = await this.api.cancelAppointment(id)
      this.patient.appointments = this.patient.appointments.filter(appointment => appointment.id != appointmentCanceled.data.id)
      this.therapist.appointments = this.therapist.appointments.filter(appointment => appointment.id != appointmentCanceled.data.id)
      this.packageAvailability.availability = this.packageAvailability.availability + 1
      this.view = null
      await this.prepareCalendar()
      await this.selectCalendarDay(moment(appointmentCanceled.data.date).toDate())
      await this.getMyAppointments()
      this.appointmentsUpdated = true
      setTimeout(() => {
        this.view = fromList ? 'appointments' : 'schedule'
        this.loadingCtrl.dismiss().finally(() => this.presentToast('Cita cancelada'))
      }, 500);
    } catch (error) {
      this.loadingCtrl.dismiss()

    }

  }

  async presentLoading(message: string = 'Guardando...') {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message
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
