import { Component } from '@angular/core';

import { Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Zoom } from '@ionic-native/zoom/ngx';
import { CometChat } from "@cometchat-pro/cordova-ionic-chat"

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  SDK_KEY = 'J8CXCoyt9nPZa237BVL02Cex4qZAoJAiQ6Vb';
  SDK_SECRET = 'fVqWIB2P1z5Nq3kAMGONrDQSALIcumhYj1o8';
  rootPage: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private toastCtrl: ToastController,
    private zoomService: Zoom
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.rootPage = 'login';

      console.log('Platform ready');

      this.zoomService.initialize(this.SDK_KEY, this.SDK_SECRET)
        .then((success) => {
          console.log(success);
          this.presentToast(success);
        })
        .catch((error) => {
          console.log(error);
          this.presentToast(error);
        });
    });
    var appID = "186830759069939";
    var region = "US";
    var appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();
    CometChat.init(appID, appSetting).then(
      () => {
        console.log("CometChat Initialization completed successfully");
        // You can now call login function.
        let apiKey = "b9f367608e4ae2b256b4432201db38803b1d040f";
        var uid = "user3";
        var name = "Dan";

        var user = new CometChat.User(uid);

        user.setName(name);

        /* CometChat.createUser(user, apiKey).then(
          user => {
            console.log("user created", user);
          }, error => {
            console.log("error", error);
          }
        ) */

        CometChat.login(uid, apiKey).then(
          user => {
            console.log("Login Successful:", { user });
            console.log("Login Successful:", JSON.stringify(user));
          },
          error => {
            console.log("Login failed with exception:", { error });
          }
        );
      },
      error => {
        console.log("Initialization failed with error:", error);
        // Check the reason for error and take appropriate action.
      }
    );

    var listnerID = "user3";
    CometChat.addCallListener(
      listnerID,
      new CometChat.CallListener({
        onIncomingCallReceived(call) {
          console.log("Incoming call:", call);
          console.log("Incoming call:", JSON.stringify(call));
          // Handle incoming call

          var sessionID = call.sessionId;

          CometChat.acceptCall(sessionID).then(
            call => {
              console.log("Call accepted successfully:", call);
              console.log("Call accepted successfully:", JSON.stringify(call));
              // start the call using the startCall() method
              CometChat.startCall(
                sessionID,
                document.getElementById("callScreen"),
                new CometChat.OngoingCallListener({
                  onUserJoined: user => {
                    /* Notification received here if another user joins the call. */
                    console.log("User joined call:", user);
                    console.log("User joined call:", JSON.stringify(user));
                    /* this method can be use to display message or perform any actions if someone joining the call */
                  },
                  onUserLeft: user => {
                    /* Notification received here if another user left the call. */
                    console.log("User left call:", user);
                    console.log("User left call:", JSON.stringify(user));
                    /* this method can be use to display message or perform any actions if someone leaving the call */
                  },
                  onCallEnded: call => {
                    /* Notification received here if current ongoing call is ended. */
                    console.log("Call ended:", call);
                    console.log("Call ended:", JSON.stringify(call));
                    /* hiding/closing the call screen can be done here. */
                  }
                })
              );
            },
            error => {
              console.log("Call acceptance failed with error", error);
              console.log("Call acceptance failed with error", JSON.stringify(error));
              // handle exception
            }
          );
        },
        onOutgoingCallAccepted(call) {
          console.log("Outgoing call accepted:", call);
          console.log("Outgoing call accepted:", JSON.stringify(call));
          // Outgoing Call Accepted

          var sessionID = call.sessionId;
          // start the call using the startCall() method
          CometChat.startCall(
            sessionID,
            document.getElementById("callScreen"),
            new CometChat.OngoingCallListener({
              onUserJoined: user => {
                /* Notification received here if another user joins the call. */
                console.log("User joined call:", user);
                console.log("User joined call:", JSON.stringify(user));
                /* this method can be use to display message or perform any actions if someone joining the call */
              },
              onUserLeft: user => {
                /* Notification received here if another user left the call. */
                console.log("User left call:", user);
                console.log("User left call:", JSON.stringify(user));
                /* this method can be use to display message or perform any actions if someone leaving the call */
              },
              onCallEnded: call => {
                /* Notification received here if current ongoing call is ended. */
                console.log("Call ended:", call);
                console.log("Call ended:", JSON.stringify(call));
                /* hiding/closing the call screen can be done here. */
              }
            })
          );


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
