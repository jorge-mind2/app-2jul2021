import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  user: any = {}
  therapist: any = {}
  supportUser: any
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private api: ApiService,
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
    // obtener el usuario asignado com sporte y mandar su receiverId
    // const receiverId = 'a-516ee1';
    const receiverId = this.user.support.cometChatId;
    this.navCtrl.navigateForward('support', { queryParams: { receiverId } })
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
