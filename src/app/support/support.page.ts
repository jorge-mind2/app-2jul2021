import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api-services/api.service';
import { StorageService } from '../api-services/storage.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['../chat/chat.page.scss', './support.page.scss'],
})
export class SupportPage implements OnInit, OnDestroy {

  conversation: any[] = [];
  input: string = ''
  loginType: string = ''
  receiverUID: string = ''
  currentUser: any
  receiver: any
  sender: any = {}
  showAssignmentBtn: boolean = false
  patientPhoto: string

  constructor(
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private api: ApiService
  ) {
    this.route.queryParams.subscribe(params => {
      this.receiverUID = params.receiverId.toLowerCase();
    })
  }

  async ngOnInit() {
    this.currentUser = await this.storageService.getCurrentUser()
    this.receiver = await this.storageService.getCurrentReceiver()
    console.log('this.receiver', this.receiver);

  }

  ngOnDestroy() {
  }

  async getMyTherapist() {
    const therapist = await this.api.getMyTherapist(this.currentUser.id)
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
