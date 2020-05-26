import { Component, OnInit } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
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

  constructor(
    private toastCtrl: ToastController,
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
    try {
      let newSession = await this.api.loginUser({ email: this.username, password: this.password })
      console.log(newSession)
      this.cometChatLogin(newSession.user);
    } catch (error) {
      console.log('error', error);
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


  private cometChatLogin(loggedUser) {
    console.log(loggedUser.cometChatId);
    console.log(this.cChatApiKey);

    CometChat.login(loggedUser.cometChatId, this.cChatApiKey).then(
      loggedUser => {
        console.log('Login Successful:', { loggedUser });
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
