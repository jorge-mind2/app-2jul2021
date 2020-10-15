import { Component, OnInit } from '@angular/core';
import { ToastController, NavController, LoadingController, AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../api-services/auth.service';
import { Device } from '@ionic-native/device/ngx';
import { TwilioService } from '../api-services/twilio.service';
import { PushNotificationsService } from '../api-services/push-notifications.service';

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
    private notificationsServcie: PushNotificationsService
  ) {
    this.route.queryParams.subscribe(params => {
      this.loginType = params.type;
    });
  }

  ngOnInit() {
    this.deviceId = this.device.uuid
    if (!this.deviceId) { // si es navegador, o no tiene deviceId, toma el deviceId que setea cometChat en el localstorage
      new Array(window.localStorage.length).fill(null).forEach((val, index) => {
        if (window.localStorage.key(index).includes(':keys_store/deviceId')) this.deviceId = window.localStorage.getItem(window.localStorage.key(index))
      })
    }
  }

  public async loginUser() {
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
      console.log({ loginData });

      const newSession = await this.auth.loginUser(loginData)
      console.log({ newSession })
      this.loadingCtrl.dismiss()
      let nextPage = this.loginType == 'therapist' ? 'home-therapist' : 'home';
      this.navCtrl.navigateForward(nextPage).then(() => this.presentToast('¡Bienvenido a Mind2!'))

    } catch (e) {
      this.loadingCtrl.dismiss()
      console.log(e);
      // let message = typeof e.error.message == 'object' ? e.error.message[0] : e.error.message
      // this.presentErrorAlert(e.error.message[0])
    }
  }

  async changeInput(ev): Promise<void> {
    console.log(ev);
    if (ev.keyCode == 13 || ev.keyCode == '13' || ev.key == 'Enter') {
      if (
        !this.username
        || this.username == ''
        || !this.password
        || this.password == ''
      ) {
        return await this.presentErrorAlert('Ingresa tu correo y tu contraseña para poder ingresar')
      }
      return await this.loginUser()
    }

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
