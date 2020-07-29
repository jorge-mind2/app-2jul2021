import { Component, OnInit } from '@angular/core';
import { AuthService } from '../api-services/auth.service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  loginType: string
  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {
    this.auth.getUserType().then(userType => this.loginType = userType)
  }

  ngOnInit() {
  }

  public navigateHome() {
    let home = this.loginType == 'therapist' ? 'home-therapist' : 'home'
    this.navCtrl.navigateBack(home)
  }

  public logout() {
    this.auth.logout();
    // this.auth.authenticationState.unsubscribe();
    this.navCtrl.navigateRoot('welcome')
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

}
