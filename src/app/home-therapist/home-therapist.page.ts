import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';
import { NavigationExtras } from '@angular/router';
import { StorageService } from '../api-services/storage.service';
import * as moment from 'moment';

@Component({
  selector: 'app-home-therapist',
  templateUrl: './home-therapist.page.html',
  styleUrls: ['../home/home.page.scss', './home-therapist.page.scss'],
})
export class HomeTherapistPage implements OnInit {
  user: any;
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

  ionViewWillEnter() {
    this.setUnreadMessages()
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
    this.auth.getCurrentUser().then(async (user: any) => {
      console.log('Mind2 user logged', user);
      if (!user || !this.auth.isAuthenticated()) return this.auth.logout()
      this.getPacients(user.id);
      this.user = user;
      const groupedAppointments = await this.api.getUserAppointments(user.id)
      // this.user.groupedAppointments = groupedAppointments.data
      console.log(groupedAppointments.data);

      const nextAppointments = groupedAppointments.data.find(data => data.group == 'next')
      const nextAppointment = nextAppointments.appointments[0]
      const date = `${nextAppointment.date} ${nextAppointment.start_time}`
      this.user.nextAppointment = nextAppointment ? {
        date: moment(date).format('DD [de] MMMM, YYYY'),
        start_time: moment(date).format('hh:mm'),
        am_pm: moment(date).format('a')
      } : undefined
      console.log(this.user.nextAppointment);
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
  }

  private async setUnreadMessages() {
    const unreadMessages = await this.storageService.getUnreadMessages()
    console.log('unreadMessages', unreadMessages);

    for (const patient of this.patients) {
      for (const message of unreadMessages) {
        if (message.id == patient.cometChatId) {
          patient.unreadMessages = message.unread
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
