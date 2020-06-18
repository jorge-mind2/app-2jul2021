import { Component, OnInit } from '@angular/core';
import { ToastController, NavController, LoadingController, AlertController } from '@ionic/angular';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { Route, ActivatedRoute } from '@angular/router';

import { COMETCHAT } from "../keys";
import { AuthService } from '../api-services/auth.service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss']
})
export class LoginPage implements OnInit {
  // Login variables
  username = '';
  password = '';
  loggedIn = false;

  cChatApiKey = COMETCHAT.APIKEY;
  uid = '';
  loginType = '';
  therapistCode = '';

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private auth: AuthService
  ) {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.loginType = params.type;
      this.uid = this.loginType == 'therapist' ? 'therapista01' : 'patient01';
    });
  }

  ngOnInit() {
  }

  public async loginUser() {
    await this.presentLoading()
    try {
      let loginData: any = { email: this.username, password: this.password }
      if (this.loginType == 'therapist') loginData = { email: this.username, password: this.password, code: this.therapistCode }
      const newSession = await this.auth.loginUser(loginData)
      this.cometChatLogin(newSession.user);
    } catch (e) {
      console.log(e);
      // let message = typeof e.error.message == 'object' ? e.error.message[0] : e.error.message
      // this.presentErrorAlert(e.error.message[0])
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


  private cometChatLogin(loggedUser) {
    CometChat.login(loggedUser.cometChatId, this.cChatApiKey).then(
      loggedUser => {
        // console.log('Login Successful:', { loggedUser });
        this.loadingCtrl.dismiss()
        this.presentToast('¡Bienvenido a Mind2!');
        // console.log('Login Successful:', JSON.stringify(user));
        let nextPage = this.loginType == 'therapist' ? 'home-therapist' : 'home';
        this.navCtrl.navigateForward(nextPage)
      },
      error => {
        console.log('Login failed with exception:', { error });
        this.loadingCtrl.dismiss()
        this.presentErrorAlert('Error al iniciar sesión')
      }
    );
  }

}
