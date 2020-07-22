import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-home-therapist',
  templateUrl: './home-therapist.page.html',
  styleUrls: ['../home/home.page.scss', './home-therapist.page.scss'],
})
export class HomeTherapistPage implements OnInit {
  user: {};
  patients: []
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private auth: AuthService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getCurrrentUSer();
  }

  public goToSessionPage(type, receiverId, patient) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        type,
        receiverId
      },
      state: {
        therapist: this.user,
        patient
      }
    };
    this.navCtrl.navigateForward('chat', { ...navigationExtras })
  }

  public getCurrrentUSer() {
    this.auth.getCurrentUser().then((user: any) => {
      console.log('Mind2 user logged', user);
      if (!user) return this.auth.logout()
      this.getPacients(user.id);
      this.user = user;
    });
  }

  public async getPacients(id) {
    const patients = await this.api.getMyPacients(id);
    console.log(patients);
    this.patients = patients
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
