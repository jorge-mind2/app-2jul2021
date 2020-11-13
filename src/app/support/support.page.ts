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
    console.log('this.receiver', this.receiver);
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
