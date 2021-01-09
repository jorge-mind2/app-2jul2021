import { Component, OnInit } from '@angular/core';
import { ToastController, NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../api-services/auth.service';
import { Device } from '@ionic-native/device/ngx';
import { TwilioService } from '../api-services/twilio.service';
import { PushNotificationsService } from '../api-services/push-notifications.service';
import { StorageService } from '../api-services/storage.service';
import { QuickstartComponent } from '../common/quickstart/quickstart.component';

@Component({
  selector: 'page-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss']
})
export class LoginPage implements OnInit {
  // Login variables
  username: string = '';
  password: string = '';
  loginType: string = '';
  therapistCode: string;

  deviceId: string
  constructor(
    private device: Device,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private auth: AuthService,
    private notificationsServcie: PushNotificationsService,
    private twilioService: TwilioService,
    private storageService: StorageService,
    private modalCtrl: ModalController
  ) {
    this.route.queryParams.subscribe(params => {
      this.loginType = params.type;
    });
  }

  ngOnInit() {
    this.deviceId = this.device.uuid
  }

  public async loginUser() {
    if (
      !this.username
      || this.username.trim() == ''
      || !this.password
      || this.password.trim() == ''
    ) {
      return await this.presentErrorAlert('Ingresa tu correo y tu contraseña para poder ingresar')
    }
    await this.presentLoading()
    try {
      let loginData: any = {
        email: this.username,
        password: this.password,
        device: this.deviceId,
        fcm: await this.notificationsServcie.getFCMToken()
      }
      if (this.loginType == 'therapist') {
        // if (!this.therapistCode) return this.presentErrorAlert('Falta código de terapeuta.')
        loginData = { ...loginData, code: this.therapistCode }
      }
      // console.log({ loginData });

      const newSession = await this.auth.loginUser(loginData)
      console.log({ newSession })

      if (!await this.storageService.getIsFirstLogin()) {
        console.log('FIRST LOGIN');
        const modal = await this.modalCtrl.create({
          component: QuickstartComponent,
          cssClass: 'my-custom-class'
        });
        modal.present().then(async () => await this.storageService.setIsFirstLogin());
      }

      this.twilioService.onTwilioConnected.subscribe(async (connected: boolean) => {
        if (await this.loadingCtrl.getTop()) this.loadingCtrl.dismiss()
        let nextPage = this.loginType == 'therapist' ? 'home-therapist' : 'home';
        this.navCtrl.navigateRoot(nextPage).then(() => this.presentToast('¡Bienvenido a Mind2!'))
        this.twilioService.onTwilioConnected.unsubscribe()
      })

    } catch (e) {
      this.loadingCtrl.dismiss()
      console.log(e);
      // let message = typeof e.error.message == 'object' ? e.error.message[0] : e.error.message
      // this.presentErrorAlert(e.error.message[0])
    }
  }

  async changeInput(ev): Promise<void> {
    return ev.keyCode == 13 || ev.keyCode == '13' || ev.key == 'Enter' ? await this.loginUser() : null
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  async presentErrorAlert(message) {

    const alert = await this.alertCtrl.create({
      header: 'Algo salió mal',
      message,
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary'
      }]
    });

    alert.present();
  }

  async presentLoading() {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message: 'Cargando...'
    })
    await loading.present();
  }

}
