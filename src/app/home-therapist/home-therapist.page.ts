import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';
import { NavigationExtras } from '@angular/router';
import { StorageService } from '../api-services/storage.service';

@Component({
  selector: 'app-home-therapist',
  templateUrl: './home-therapist.page.html',
  styleUrls: ['../home/home.page.scss', './home-therapist.page.scss'],
})
export class HomeTherapistPage implements OnInit {
  user: {};
  patients: any[]
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private storageService: StorageService,
    private auth: AuthService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getCurrrentUSer();
    this.storageService.onSetUnreadMessages.subscribe(message => this.setUnreadMessages())
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
    for (const patient of patients) {
      if (patient.photo) patient.avatar = this.api.getPhotoProfile(patient.photo)
      else patient.avatar = 'https://api.adorable.io/avatars/285/dev.png'
    }
    this.patients = patients
    await this.setUnreadMessages()
  }

  private async setUnreadMessages() {
    const unreadMessages = await this.storageService.getUnreadMessages()
    for (const patient of this.patients) {
      for (const message of unreadMessages) {
        if (message.id == patient.cometChatId && message.unread) {
          patient.unreadMessages = true
        }
      }
    }
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
