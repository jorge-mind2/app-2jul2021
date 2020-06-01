import { Component } from '@angular/core';

import { Platform, ToastController, NavController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { CometChat } from "@cometchat-pro/cordova-ionic-chat"

import { COMETCHAT } from "./keys";
import { AuthService } from './api-services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  private rootPage: string = 'welcome';

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private auth: AuthService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      // this.presentCallAlert('sessionID')
      this.auth.authenticationState.subscribe(state => {
        let userType = this.auth.getUserType();
        console.log(state);

        if (!state) {
          this.navCtrl.navigateRoot(this.rootPage)
        }
        else {
          this.rootPage = userType == 'therapist' ? 'home-therapist' : 'home';
          this.navCtrl.navigateRoot(this.rootPage);
        }
      })
      console.log('Platform ready');
    });
    const appID = COMETCHAT.APPID;
    const region = "US";
    const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();
    CometChat.init(appID, appSetting).then(
      () => {
        console.log("CometChat Initialization completed successfully");
        // You can now call login function.

        /* CometChat.createUser(user, apiKey).then(
          user => {
            console.log("user created", user);
          }, error => {
            console.log("error", error);
          }
        ) */

      },
      error => {
        console.log("Initialization failed with error:", error);
        // Check the reason for error and take appropriate action.
      }
    );

    const listnerID = "therapist01";
    const __self = this;
    CometChat.addCallListener(
      listnerID,
      new CometChat.CallListener({
        async onIncomingCallReceived(call) {
          console.log("Incoming call:", call);
          // console.log("Incoming call:", JSON.stringify(call));
          // Handle incoming call
          const sessionID = call.sessionId;
          console.log(sessionID);

          // this.presentCallAlert(sessionID)
          const alert = await __self.alertCtrl.create({
            header: 'Llamada entrante',
            message: 'Tu terapeuta está llamando.',
            backdropDismiss: false,
            buttons: [{
              text: 'Contestar',
              cssClass: 'secondary',
              handler: () => __self.acceptCall(sessionID)
            }]
          });

          console.log(alert);

          alert.present();

        },
        async onOutgoingCallAccepted(call) {
          console.log("Outgoing call accepted:", call);
          console.log("Outgoing call accepted:", JSON.stringify(call));
          // Outgoing Call Accepted

          var sessionID = call.sessionId;
          // start the call using the startCall() method
          await __self.startCall(sessionID);


        },
        onOutgoingCallRejected(call) {
          console.log("Outgoing call rejected:", call);
          console.log("Outgoing call rejected:", JSON.stringify(call));
          // Outgoing Call Rejected
        },
        onIncomingCallCancelled(call) {
          console.log("Incoming call calcelled:", call);
          console.log("Incoming call calcelled:", JSON.stringify(call));
        }
      })
    );

  }

  private acceptCall(sessionID) {
    CometChat.acceptCall(sessionID).then(
      call => {
        console.log("Call accepted successfully:", call);
        console.log("Call accepted successfully:", JSON.stringify(call));
        // start the call using the startCall() method
        this.startCall(sessionID)
      },
      error => {
        console.log("Call acceptance failed with error", error);
        console.log("Call acceptance failed with error", JSON.stringify(error));
        // handle exception
      }
    );
  }

  private startCall(sessionID) {
    this.navCtrl.navigateForward('video-call', { queryParams: { sessionID } })
  }

  async presentCallAlert(sessionID) {
    console.log(sessionID);

    const alert = await this.alertCtrl.create({
      header: 'Llamada entrante',
      message: 'Tu terapeuta está llamando.',
      backdropDismiss: false,
      buttons: [{
        text: 'Contestar',
        cssClass: 'secondary',
        handler: () => this.acceptCall(sessionID)
      }]
    });

    alert.present();
  }

  async presentToast(text) {
    return console.log(text)
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 300,
      position: 'top'
    });
    toast.present();
  }
}
