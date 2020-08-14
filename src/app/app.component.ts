import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './api-services/auth.service';
import { CometChatService } from './comet-chat.service';
import { StorageService } from './api-services/storage.service';
import { PushNotificationsService } from './api-services/push-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  private rootPage: string = 'welcome';
  loddgerUser: any
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private auth: AuthService,
    private cometchat: CometChatService,
    private storageService: StorageService,
    private notifications: PushNotificationsService,
  ) {
    this.auth.authenticationState.subscribe(async state => {
      this.splashScreen.hide();
      console.log('state', state);
      const userType = await this.auth.getUserType();
      console.log('userType', userType);

      if (userType && state) {
        return true;
      }
      else {
        this.navCtrl.navigateRoot(this.rootPage)

      }

    })
    this.initializeApp();

  }

  initializeApp() {
    this.platform.ready().then(async () => {
      // this.auth.checkToken()
      await this.auth.checkToken()
      this.statusBar.backgroundColorByHexString('#4d1c6bab')
      console.log('Platform ready');
      this.cometchat.initializeCometChat()
      if (this.platform.is('cordova')) this.notifications.initFirebase()
      this.notifications.onNotification.subscribe(async message => {
        await this.storageService.setUnreadMessages(message, true)
      })
    });

  }

}
