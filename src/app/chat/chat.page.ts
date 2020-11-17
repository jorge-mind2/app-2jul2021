import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform, AlertController, ModalController, NavController, ToastController, PopoverController, Events } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';
import { ApiService } from '../api-services/api.service';
import { StorageService } from '../api-services/storage.service';
import { OptionsComponent } from './options/options.component';
import { VideoCallComponent } from '../common/video-call/video-call.component';
import { TwilioService } from '../api-services/twilio.service';
import { PushNotificationsService } from '../api-services/push-notifications.service';
import { ViewProfileComponent } from '../common/view-profile/view-profile.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {
  receiverUID: string
  loginType: string = '';
  therapist: any
  patient: any = {}
  receiver: any
  sender: any
  chatId: string
  callInProgress: boolean = false
  onAcceptedCallSubscriber: Subscription

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
    private api: ApiService,
    private storage: StorageService,
    private twilioService: TwilioService,
    private notification: PushNotificationsService
  ) {
    this.route.queryParams.subscribe(params => {
      this.loginType = params.type;
      if (this.loginType == 'therapist') this.defaultBackHref = 'home-therapist'
      if (this.router.getCurrentNavigation().extras.state) {
        this.therapist = this.router.getCurrentNavigation().extras.state.therapist
        this.patient = this.router.getCurrentNavigation().extras.state.patient
      }
    })
  }

  async ngOnInit() {
    console.log('ngOnInit');
    this.receiver = await this.storage.getCurrentReceiver()
    if (this.platform.is('cordova') && this.platform.is('android')) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => console.log('Has CAMERA permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO).then(
        result => console.log('Has RECORD_AUDIO permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT).then(
        result => console.log('Has CAPTURE_AUDIO_OUTPUT permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS).then(
        result => console.log('Has MODIFY_AUDIO_SETTINGS permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_NOTIFICATION_POLICY).then(
        result => console.log('Has ACCESS_NOTIFICATION_POLICY permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_NOTIFICATION_POLICY)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_WIFI_STATE).then(
        result => console.log('Has ACCESS_WIFI_STATE permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_WIFI_STATE)
      );
      /*
      MODIFY_AUDIO_SETTINGS
      ACCESS_NOTIFICATION_POLICY
      ACCESS_WIFI_STATE
      */
      this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.CAMERA,
        this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT,
        this.androidPermissions.PERMISSION.RECORD_AUDIO,
        this.androidPermissions.PERMISSION.MODIFY_AUDIO_SETTINGS,
        this.androidPermissions.PERMISSION.ACCESS_NOTIFICATION_POLICY,
        this.androidPermissions.PERMISSION.ACCESS_WIFI_STATE
      ]);
    }

    this.onAcceptedCallSubscriber = this.notification.onAcceptedCall.subscribe(async notification => {
      await this.twilioService.dismissOutcomingCallModal()
      await this.openVideoCallScreen()
    })
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');

    this.onAcceptedCallSubscriber.unsubscribe()
  }

  /**
   * Init twilio video Call
  */
  async openVideoCallScreen() {
    if (this.callInProgress) return
    const modal = await this.modalCtrl.create({
      component: VideoCallComponent,
      componentProps: {
        isHost: this.loginType == 'therapist'
      }
    });
    this.callInProgress = true
    modal.onDidDismiss().finally(() => this.callInProgress = false)
    return await modal.present()
  }

  async presentCallAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Iniciar llamada',
      message: '¿Deseas iniciar una videollamada con tu paciente?',
      backdropDismiss: false,
      buttons: [{
        text: 'Cancelar',
        cssClass: 'text-danger'
      }, {
        text: 'Aceptar',
        cssClass: 'text-primary',
        handler: value => this.initSession()
      },]
    })

    alert.present();
  }

  async initSession() {
    const checkPermissionData: any = await this.api.checkSessionTime()
    if (checkPermissionData.data) {
      await this.initCall()
    }
  }

  async initCall() {
    const receiverId = +this.receiver.id
    this.api.callTo(receiverId).then((response: any) => {
      console.log('response callTo', response);
      const call = response.data
      this.twilioService.presentOutcomingCallScreen(this.receiver.name, receiverId)
    })
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

  async showProfile() {
    console.log(this.receiver.id)
    const modal = await this.modalCtrl.create({
      component: ViewProfileComponent,
      componentProps: {
        id: +this.receiver.id
      }
    });
    return await modal.present()
  }

  async presentModal() {
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
    const userType = await this.storage.getUserType()
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