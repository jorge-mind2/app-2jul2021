import { Component, ChangeDetectorRef } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './api-services/auth.service';
import { CometChatService } from './comet-chat.service';

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
    private ref: ChangeDetectorRef,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.backgroundColorByHexString('#4d1c6bab')
      console.log('Platform ready');
      this.cometchat.initializeCometChat()
      await this.auth.checkToken()
      this.auth.authenticationState.subscribe(async state => {
        const userType = await this.auth.getUserType();
        if (userType) {
          this.splashScreen.hide();
          if (!state) {
            this.navCtrl.navigateRoot(this.rootPage)
          }
          else {
            return true;
            this.rootPage = userType == 'therapist' ? 'home-therapist' : 'home';
            this.navCtrl.navigateRoot(this.rootPage);
          }
        }
      })
    });

  }

}
