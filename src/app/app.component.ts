import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { CometChat } from "@cometchat-pro/cordova-ionic-chat"

import { COMETCHAT } from "./keys";
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
    private cometchat: CometChatService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#4d1c6b')
      this.splashScreen.hide();
      // this.presentCallAlert('sessionID')
      console.log('Platform ready');
      this.auth.authenticationState.subscribe(state => {
        let userType = this.auth.getUserType();
        // console.log(state);
        if (userType) {
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
    const appID = COMETCHAT.APPID;
    const region = "US";
    const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();
    CometChat.init(appID, appSetting).then(
      () => {
        console.log("CometChat Initialization completed successfully");

        // You can now call login function.
        this.auth.getCurrentUser().then(async usr => {
          console.log({ usr });
          if (usr) await this.cometchat.login(usr)
        })

      },
      error => {
        console.log("Initialization failed with error:", error);
        // Check the reason for error and take appropriate action.
      }
    );

  }

}
