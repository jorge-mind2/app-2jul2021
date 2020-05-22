import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Zoom } from '@ionic-native/zoom/ngx';

@Component({
  selector: 'page-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss']
})
export class LoginPage {
  // Login variables
  userName = '';
  password = '';
  loggedIn = false;

  // Meeting variables
  meetingNumber = null;
  meetingPassword = '';
  displayName = 'Zoom Ionic';

  constructor(
    private toastCtrl: ToastController,
    private zoomService: Zoom,
  ) {

  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  /**
   * Log user in with Zoom username and password.
   */
  login() {
    console.log('Going to login');
    this.zoomService.login(this.userName, this.password).then((success) => {
      console.log(success.message);
      this.presentToast(success.message);
      this.loggedIn = true;
      this.userName = '';
      this.password = '';
    }).catch((error) => {
      console.log(error);
      this.presentToast(error.message);
    });
  }

  /**
   * Log user out.
   */
  logout() {
    console.log('Going to logout');
    this.zoomService.logout().then((success) => {
      console.log(success.message);
      this.presentToast(success.message);
      this.loggedIn = false;
    }).catch((error) => {
      this.presentToast(error.message);
      console.log(error);
    });
  }

}
