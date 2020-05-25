import { Component, OnInit } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { Route, ActivatedRoute } from '@angular/router';

import { COMETCHAT } from "../keys";

@Component({
  selector: 'page-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss']
})
export class LoginPage implements OnInit {
  // Login variables
  userName = '';
  password = '';
  loggedIn = false;

  cChatApiKey = COMETCHAT.APIKEY;
  uid = '';
  loginType = '';

  constructor(
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      this.loginType = params.type;
      this.uid = this.loginType == 'therapist' ? 'therapista01' : 'patient01';
    });
  }

  ngOnInit() {
  }

  public loginUser() {
    this.cometChatLogin();
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }


  private cometChatLogin() {
    console.log(this.uid);
    console.log(this.cChatApiKey);

    CometChat.login(this.uid, this.cChatApiKey).then(
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
