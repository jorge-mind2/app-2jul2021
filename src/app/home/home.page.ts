import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';
import { StorageService } from '../api-services/storage.service';
import { ApiService } from '../api-services/api.service';
import * as moment from 'moment'

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user: any = {}
  supportUser: any
  therapistMessagesUnread: boolean = false
  supportMessagesUnread: boolean = false
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private auth: AuthService,
    private storageService: StorageService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.storageService.onSetUnreadMessages.subscribe(message => this.setUnreadMessages())
    // const p = this.api.getPackasAvailability().then(data => console.log('getPackasAvailability', data))
  }

  ionViewWillEnter() {
    this.getUser();
    this.setUnreadMessages()
  }

  private getUser(event?) {
    this.auth.getCurrentUser().then(async (user: any) => {
      console.log('currentUser', user);
      if (!user || !this.auth.isAuthenticated()) return await this.auth.logout()
      if (user.therapist) user.therapist.photo = this.api.getPhotoProfile(user.therapist)
      this.user = user;
      const groupedAppointments = await this.api.getUserAppointments(user.id)
      // this.user.groupedAppointments = groupedAppointments.data
      const nextAppointments = groupedAppointments.data.find(data => data.group == 'next')
      const nextAppointment = nextAppointments.appointments[0]
      const date = nextAppointment ? `${nextAppointment.date} ${nextAppointment.start_time}` : undefined
      this.user.nextAppointment = nextAppointment ? {
        date: moment(date).format('DD [de] MMMM, YYYY'),
        start_time: moment(date).format('hh:mm'),
        am_pm: moment(date).format('a')
      } : undefined
      // console.log(this.user.nextAppointment);
      if (event) event.target.complete()
    }).catch(error => {
      if (event) event.target.complete()
    });
  }

  private async setUnreadMessages() {
    if (!this.user || !this.user.role) return
    const unreadMessages = await this.storageService.getUnreadMessages()

    if (this.user.therapist) {
      this.therapistMessagesUnread = unreadMessages.some(message => message.id == this.user.therapist.cometChatId && message.unread)
    }
    if (this.user.role.name == 'patient') this.supportMessagesUnread = unreadMessages.some(message => message.id == this.user.support.cometChatId && message.unread)

  }

  public goToSessionPage(type) {
    if (!this.user.therapist) {
      this.presentErrorAlert('Aviso', 'Aún no tienes un terapeuta asignado, contactanos en el chat de servicio para poder asignarte uno.')
    } else {
      const receiverId = this.user.therapist.cometChatId;
      this.navCtrl.navigateForward('chat', { queryParams: { type, receiverId } })
    }
  }

  public goToSupportChat() {
    const receiverId = this.user.support.cometChatId;
    this.navCtrl.navigateForward('support', { queryParams: { receiverId } })
  }

  async openNextAppointment() {
    this.user = await this.auth.getCurrentUser()
    const modal = await this.modalCtrl.create({
      component: NextAppointmentComponent,
      componentProps: {
        patient: this.user,
        therapist: this.user.therapist
      }
    });
    return await modal.present()
  }

  async presentErrorAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary'
      }]
    });

    return alert.present();
  }

  public async presentLogoutAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar tu sesión de Mind2?',
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'text-secondary',
        handler: () => this.logout()
      }, {
        text: 'Cancelar',
        cssClass: 'primary'
      }]
    })

    alert.present();
  }

  async logout() {
    await this.auth.logout()
    this.navCtrl.navigateRoot('welcome')
  }

}
