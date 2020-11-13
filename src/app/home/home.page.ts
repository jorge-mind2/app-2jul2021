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
  therapistChannel: string
  supportChannel: string
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private auth: AuthService,
    private storageService: StorageService,
    private api: ApiService
  ) { }

  async ngOnInit() {
    await this.getUser();
  }

  getUser(event?) {
    this.storageService.getCurrentUser().then(async (user: any) => {
      if (!user) return await this.auth.logout()
      if (event) {
        const dataServerUser = await this.auth.getServerCurrentUser()
        user = dataServerUser.data
      }
      const groupedAppointments = await this.api.getUserAppointments(user.id)
      const nextAppointments = groupedAppointments.data.find(data => data.group == 'next')
      const nextAppointment = nextAppointments.appointments[0]
      const date = nextAppointment ? `${nextAppointment.date} ${nextAppointment.start_time}` : undefined
      user.nextAppointment = nextAppointment ? {
        date: moment(date).format('DD [de] MMMM, YYYY'),
        start_time: moment(date).format('hh:mm'),
        am_pm: moment(date).format('a')
      } : undefined
      await this.storageService.updateCurrentUser(user)
      this.user = user;
      this.setChannels()
      // console.log(this.user.nextAppointment);
      if (event) event.target.complete()
    }).catch(error => {
      if (event) event.target.complete()
    });
  }

  async setChannels() {
    const therapistChannel = this.user.channels.find(channel => channel.type == 'therapist')
    const supportChannel = this.user.channels.find(channel => channel.type == 'support')
    if (therapistChannel) {
      this.therapistChannel = therapistChannel.unique_name
    }
    if (supportChannel) {
      this.supportChannel = supportChannel.unique_name
    }
    this.therapistMessagesUnread = await this.storageService.existUnreadMessages(this.therapistChannel)
    this.supportMessagesUnread = await this.storageService.existUnreadMessages(this.supportChannel)
    this.storageService.onSetUnreadMessages.subscribe(data => {
      if (this.therapistChannel == data.channel) {
        this.therapistMessagesUnread = data.status
      }
      if (this.supportChannel == data.channel) {
        this.supportMessagesUnread = data.status
      }
    })
  }

  public goToSessionPage(type) {
    if (!this.user.therapist) {
      this.presentErrorAlert('Aviso', 'Aún no tienes un terapeuta asignado, contactanos en el chat de servicio para poder asignarte uno.')
    } else {
      const receiverId = this.user.therapist.id;
      const channel = this.user.channels.find(channel => channel.type == 'therapist')
      this.storageService.setCurrentchatId(channel.unique_name)
      this.storageService.setCurrentReceiver(this.user.therapist)
      this.navCtrl.navigateForward('chat', { queryParams: { type, receiverId } })
    }
  }

  public goToSupportChat() {
    const receiverId = this.user.support.id;
    const channel = this.user.channels.find(channel => channel.type == 'support')
    this.storageService.setCurrentchatId(channel.unique_name)
    this.storageService.setCurrentReceiver(this.user.support)
    this.navCtrl.navigateForward('support', { queryParams: { receiverId } })
  }

  async openNextAppointment() {
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
