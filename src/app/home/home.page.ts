import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user: any = {}
  supportUser: any
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.getUser();
  }

  private getUser() {
    this.auth.getCurrentUser().then(async (user: any) => {
      console.log('currentUser', user);
      if (!user) return await this.auth.logout()
      this.user = user;
    });
  }

  public goToSessionPage(type) {
    if (!this.user.therapist) {
      this.presentErrorAlert('Aviso', 'Aún no tienes un terapeuta asignado, ve al chat de servicio para que te puedan asingar a uno.')
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
    const modal = await this.modalCtrl.create({
      component: NextAppointmentComponent,
      componentProps: {
        patient: this.user,
        therapist: this.user.therapist
      }
    });
    return await modal.present()
  }

  async presentErrorAlert(header, message) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary'
      }]
    });

    alert.present();
  }

}
