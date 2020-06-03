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
      await this.getTherapist(user.id);
      this.user = user;
    });

  }

  public async getTherapist(id) {
    let therapist = await this.api.getMyTherapist(id);
    console.log('user Therapist', therapist);
    this.therapist = therapist;
  }

  public goToSessionPage(type) {
    if (!this.therapist) {
      this.presentErrorAlert('Aviso', 'Aún no tienes un terapeuta asignado, ve al chat de servicio para que te puedan asingar a uno.')
    } else {
      const receiverId = this.therapist.cometChatId;
      this.navCtrl.navigateForward('chat', { queryParams: { type, receiverId } })
    }
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
