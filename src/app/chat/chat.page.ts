import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Platform, AlertController, ModalController, NavController, ToastController, PopoverController, Events, IonContent } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { CalendarModalOptions } from 'ion2-calendar';
import { CometChatService } from '../api-services/comet-chat.service';
import { AuthService } from '../api-services/auth.service';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';
import { ApiService } from '../api-services/api.service';
import { StorageService } from '../api-services/storage.service';
import { OptionsComponent } from './options/options.component';
import { TwilioCallComponent } from '../common/twilio-call/twilio-call.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  receiverUID: string
  loginType: string = '';
  therapist: any
  patient: any = {}
  receiver: any
  sender: any
  chatId: string

  defaultBackHref: string = 'home'
  constructor(
    private platform: Platform,
    private events: Events,
    private androidPermissions: AndroidPermissions,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private cometchat: CometChatService,
    private auth: AuthService,
    private api: ApiService,
    private storage: StorageService
  ) {
    this.route.queryParams.subscribe(params => {
      this.loginType = params.type;
      if (this.loginType == 'therapist') this.defaultBackHref = 'home-therapist'
      this.receiverUID = params.receiverId.toLowerCase();
      if (this.router.getCurrentNavigation().extras.state) {
        this.therapist = this.router.getCurrentNavigation().extras.state.therapist
        this.patient = this.router.getCurrentNavigation().extras.state.patient
      }
    })
  }

  async ngOnInit() {
    this.receiver = await this.storage.getCurrentReceiver()
    if (this.platform.is('cordova') && this.platform.is('android')) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT)
      );

      this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.CAMERA,
        this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT,
        this.androidPermissions.PERMISSION.RECORD_AUDIO
      ]);
    }
  }

  /**
   * Init CometChat video Call
  */
  private initVideoCall() {
    this.cometchat.initVideoCall(this.receiverUID)
  }

  async openTwilioScreen(ev) {
    const modal = await this.modalCtrl.create({
      component: TwilioCallComponent,
      componentProps: {
      }
    });
    return await modal.present()
  }

  async presentCallAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Iniciar llamada',
      message: '¿Deseas iniciar la videollamada con tu paciente?',
      backdropDismiss: false,
      buttons: [{
        text: 'Cancelar',
        cssClass: 'text-danger'
      }, {
        text: 'Aceptar',
        cssClass: 'text-primary',
        handler: () => this.initVideoCall()
      },]
    })

    alert.present();
  }

  async presentOptions(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: OptionsComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();
    return this.events.subscribe('onSelectOption', selected => {
      if (selected == 'session_price') {
        this.presentPricePrompt()
      }
      this.events.unsubscribe('onSelectOption')
      this.popoverCtrl.dismiss()
    })
  }

  async presentPricePrompt() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      message: `Elige el costo por sesión para ${this.patient.name}. (Sólo se puede cambiar 1 vez)`,
      inputs: [
        {
          name: 'price',
          type: 'number',
          value: this.patient.session_price || 400,
          placeholder: 'Costo por sesión',
          disabled: this.patient.session_price > 0,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Aceptar',
          handler: (promptData) => {
            console.log('Confirm Ok');
            this.saveSessionPrice(promptData.price)
          }
        }
      ]
    });

    await alert.present();
  }

  async saveSessionPrice(newPrice) {
    if (this.patient.session_price && this.patient.session_price > 0) return
    try {
      const setedPrice = await this.api.setUserSessionPrice(this.patient.id, newPrice)
      this.patient.session_price = newPrice
      console.log('setedPrice', setedPrice);
      this.presentToast('Guardado')
    } catch (error) {
      console.log(error);
    }
  }

  async presentModal() {
    const options: CalendarModalOptions = {
      color: 'primary'
    };
    const modal = await this.modalCtrl.create({
      component: NextAppointmentComponent,
      componentProps: {
        patient: this.patient,
        therapist: this.therapist
      }
    });
    return await modal.present()
  }

  public async navigateHome() {
    const userType = await this.auth.getUserType()
    let home = userType == 'therapist' ? 'home-therapist' : 'home'
    this.navCtrl.navigateBack(home)
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}