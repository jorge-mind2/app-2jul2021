import { Component, OnInit } from '@angular/core';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.page.html',
  styleUrls: ['./video-call.page.scss'],
})
export class VideoCallPage implements OnInit {

  sessionID: string;

  constructor(
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {
    this.route.queryParams.subscribe(params => this.sessionID = params.sessionID)
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.sessionID) this.startCall()
      else this.presentAlert()

    }, 500);
  }

  async presentAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Sin sesión',
      message: 'No es hora de tu sesión.',
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary',
        handler: () => this.navCtrl.back()
      }]
    });

    await alert.present();
  }

  private startCall() {
    console.log(this.sessionID);

    CometChat.startCall(
      this.sessionID,
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
          this.navCtrl.back()
        }
      })
    );
  }

}
