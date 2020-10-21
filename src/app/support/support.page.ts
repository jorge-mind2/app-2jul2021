import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../api-services/api.service';
import { StorageService } from '../api-services/storage.service';
import { PushNotificationsService } from '../api-services/push-notifications.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['../chat/chat.page.scss', './support.page.scss'],
})
export class SupportPage implements OnInit {

  conversation: any[] = [];
  input: string = ''
  loginType: string = ''
  currentUser: any
  receiver: any
  sender: any = {}
  showAssignmentBtn: boolean = false
  patientPhoto: string

  constructor(
    private alertCtrl: AlertController,
    private storageService: StorageService,
    private api: ApiService,
    private notifications: PushNotificationsService,
  ) { }

  async ngOnInit() {
    this.currentUser = await this.storageService.getCurrentUser()
    this.receiver = await this.storageService.getCurrentReceiver()
    this.notifications.onAssignedTherapist.subscribe(notification => this.getMyTherapist())
    console.log('this.receiver', this.receiver);
  }

  async getMyTherapist() {
    const therapist = await this.api.getMyTherapist()
    this.currentUser.therapist = therapist
    await this.storageService.setCurrentUser(this.currentUser).then(() => this.presentAlert(`Ahora tu terapeuta es: ${therapist.name} ${therapist.last_name}`))
    this.showAssignmentBtn = false
    await this.storageService.getCurrentUser()
  }

  async presentAlert(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Listo',
      message,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'text-secondary'
      }]
    });

    await alert.present();
  }

}
