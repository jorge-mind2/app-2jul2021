import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';
import { NavigationExtras } from '@angular/router';
import { StorageService } from '../api-services/storage.service';
import * as moment from 'moment';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';

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
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private storageService: StorageService,
    private auth: AuthService,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getCurrrentUSer();
    this.storageService.onSetUnreadMessages.subscribe(message => this.setUnreadMessages())
  }

  async ionViewDidEnter() {
    await this.setUnreadMessages()
  }

  public goToSessionPage(type, patient) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        type,
        receiverId: patient.id
      },
      state: {
        therapist: this.user,
        patient
      }
    };
    const channel = patient.channels.find(channel => channel.type == 'therapist')
    this.storageService.setCurrentchatId(channel.unique_name)
    this.storageService.setCurrentReceiver(patient)
    this.navCtrl.navigateForward('chat', { ...navigationExtras })
  }

  public getCurrrentUSer(event?) {
    this.storageService.getCurrentUser().then(async (user: any) => {
      console.log('Mind2 user logged', user);
      if (!user) return this.auth.logout()
      this.getMyPatients(user.id);
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
      if (event) event.target.complete()
    }).catch(error => {
      if (event) event.target.complete()
    });
  }

  public async getMyPatients(id) {
    const patients = await this.api.getMyPatients(id);
    console.log(patients);
    for (const patient of patients) {
      patient.avatar = this.api.getPhotoProfile(patient)
    }
    this.patients = patients
    await this.setUnreadMessages()
  }

  private async setUnreadMessages() {
    if (this.patients) {
      for await (const patient of this.patients) {
        const channel = patient.channels.find(channel => channel.type == 'therapist')
        if (channel) patient.unreadMessages = await this.storageService.existUnreadMessages(channel.unique_name)
      }
    }
  }

  async showSchedule() {
    const patient = {}
    const modal = await this.modalCtrl.create({
      component: NextAppointmentComponent,
      componentProps: {
        patient,
        therapist: this.user,
        onlySchedule: true
      }
    });
    return await modal.present()
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
