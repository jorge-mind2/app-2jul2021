import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';
import { StorageService } from '../api-services/storage.service';
import { PushNotificationsService } from '../api-services/push-notifications.service';

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
    private notifications: PushNotificationsService
  ) { }

  ngOnInit() {
    this.storageService.onSetUnreadMessages.subscribe(message => this.setUnreadMessages())
  }

  ionViewWillEnter() {
    this.getUser();
    this.setUnreadMessages()
  }

  private getUser() {
    this.auth.getCurrentUser().then(async (user: any) => {
      // console.log('currentUser', user);
      if (!user) return await this.auth.logout()
      this.user = user;
    });
  }

  private async setUnreadMessages() {
    const unreadMessages = await this.storageService.getUnreadMessages()

    if (this.user.therapist) {
      this.therapistMessagesUnread = unreadMessages.some(message => message.id == this.user.therapist.cometChatId && message.unread)
    }
    this.supportMessagesUnread = unreadMessages.some(message => message.id == this.user.support.cometChatId && message.unread)

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
