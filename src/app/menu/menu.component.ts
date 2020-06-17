import { Component, OnInit } from '@angular/core';
import { AuthService } from '../api-services/auth.service';
import { NavController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  public navigateHome() {
    const userType = this.auth.getUserType()
    let home = userType == 'therapist' ? 'home-therapist' : 'home'
    this.navCtrl.navigateBack(home)
  }

  public logout() {
    this.auth.logout();
    // this.auth.authenticationState.unsubscribe();
    this.navCtrl.navigateRoot('welcome')
  }

  private async presentLogoutAlert() {
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
