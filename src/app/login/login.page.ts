import { Component, OnInit } from '@angular/core';
import { ToastController, NavController, LoadingController, AlertController } from '@ionic/angular';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { Route, ActivatedRoute } from '@angular/router';

import { ApiService } from "../api.service";

import { COMETCHAT } from "../keys";

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
    private api: ApiService
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
    await this.presentLoading();
    try {
      let loginData = { email: this.username, password: this.password, code: this.therapistCode }
      const newSession = await this.api.loginUser(loginData)
      console.log(newSession)
      this.cometChatLogin(newSession.user);
    } catch (e) {
      this.presentErrorAlert(e.error.message[0])
      this.loadingCtrl.dismiss()
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
    console.log(loggedUser.cometChatId);
    console.log(this.cChatApiKey);

    CometChat.login(loggedUser.cometChatId, this.cChatApiKey).then(
      loggedUser => {
        console.log('Login Successful:', { loggedUser });
        this.loadingCtrl.dismiss()
        this.presentToast('¡Bienvenido a Mind2!');
        // console.log('Login Successful:', JSON.stringify(user));
        let nextPage = this.loginType == 'therapist' ? 'home-therapist' : 'home';
        this.navCtrl.navigateForward(nextPage);
      },
      error => {
        console.log('Login failed with exception:', { error });
      }
    );
  }

}
