import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: object = {}
  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private auth: AuthService,
    private api: ApiService
  ) { }

  async ngOnInit() {
    await this.getUserInfo()
  }

  private getUserInfo() {
    this.auth.getCurrentUser().then(async (user: any) => {
      if (!user.detail) {
        const info = await this.api.getTherapistProfile(user.id)
        this.api.setTherapistDetail(info.data.detail)
        console.log(info);
        user.detail = info.data.detail
      }
      this.user = user
      console.log('user', user)
    })
  }

  async logout() {
    await this.auth.logout()
    this.navCtrl.navigateRoot('welcome')
  }

  private async presentLogoutAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar tu sesión de Mind2?',
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary',
        handler: () => this.logout()
      }, {
        text: 'Cancelar',
        cssClass: 'primary'
      }]
    })

    alert.present();
  }

}
