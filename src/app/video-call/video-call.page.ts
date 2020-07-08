import { Component, OnInit, OnDestroy } from '@angular/core';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ActivatedRoute } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from '../api-services/auth.service';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.page.html',
  styleUrls: ['./video-call.page.scss'],
})
export class VideoCallPage implements OnInit, OnDestroy {

  sessionID: string;
  callEnded: boolean = false
  public timeBegan = null;
  public timeStopped: any = null;
  public stoppedDuration: any = 0;
  public started = null;
  public running = false;
  public blankTime = "00:00.000";
  public time = "00:00.000";
  currentUser: any = {}

  constructor(
    private route: ActivatedRoute,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private auth: AuthService
  ) {
    this.route.queryParams.subscribe(params => this.sessionID = params.sessionID)
  }

  async ngOnInit() {
    setTimeout(() => {
      if (this.sessionID) this.startCall()
      else this.presentAlert('Sin Sesión', 'No tienes sesión programada para hoy.')
    }, 500);
    this.currentUser = await this.auth.getCurrentUser()
  }

  ngOnDestroy() {
    console.log('destroy\'ll mothafaka');
    this.reset()

  }


  async presentAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary',
        handler: () => this.goBack()
      }]
    });

    await alert.present();
  }

  private startCall() {
    console.log(this.sessionID);

    console.log('AcTIVE CALL', CometChat.getActiveCall());
    if (!CometChat.getActiveCall()) {
      return this.presentAlert('No hay llamada', 'No tienes ninguna llamada activa.')
    }

    this.start()
    console.log(CometChat.CallController.callController.getCallListner())
    CometChat.startCall(
      this.sessionID,
      document.getElementById("callScreen"),
      new CometChat.OngoingCallListener({
        onUserJoined: async (user: CometChat.User) => {
          /* Notification received here if another user joins the call. */
          console.log("//////////////////User joined call:", user);
          /* this method can be use to display message or perform any actions if someone joining the call */
        },
        onUserLeft: async (user: CometChat.User) => {
          /* Notification received here if another user left the call. */
          console.log("////////////User left call:", user);
          /* this method can be use to display message or perform any actions if someone leaving the call */
          if (!this.callEnded) await this.presentAlert('Llamada Finalizada', `${user.getName()} salió de la llamada.`).finally(() => this.goBack())
        },
        onCallEnded: async (call: CometChat.Call) => {
          /* Notification received here if current ongoing call is ended. */
          console.log("Call ended:", call);
          /* hiding/closing the call screen can be done here. */
          this.callEnded = true
          if (call.getStatus() == 'ended') {
            return await this.presentAlert('Llamada Finalizada', 'La llamada ha terminado.').finally(() => this.goBack())
          }
        },
        onYouLeft: user => console.log('//////onYouLeft', { user }),
        onYouJoined: user => console.log('//////onYouJoined', { user }),
        onError: error => console.log('//////ERROOOOR', { error }),
      }, this)
    );
  }

  async goBack(callStatus: string = null): Promise<boolean> {
    return await this.navCtrl.navigateBack(['chat'], {
      queryParams: {
        sessionID: null,
        callStatus
      },
      queryParamsHandling: 'merge'
    })
  }

  start(): void {
    if (this.running) return;

    if (this.timeBegan === null) {
      this.reset();
      this.timeBegan = new Date();
    }

    if (this.timeStopped !== null) {
      let newStoppedDuration: any = (+new Date() - this.timeStopped)
      this.stoppedDuration = this.stoppedDuration + newStoppedDuration;
    }

    this.started = setInterval(this.clockRunning.bind(this), 10);
    this.running = true;
  }

  stop(): void {
    this.running = false;
    this.timeStopped = new Date();
    return clearInterval(this.started);
  }

  reset(): void {
    this.running = false;
    this.stoppedDuration = 0;
    this.timeBegan = null;
    this.timeStopped = null;
    this.time = this.blankTime;
    return clearInterval(this.started);
  }

  zeroPrefix(num: number, digit: number): string {
    let zero = '';
    for (let i = 0; i < digit; i++) {
      zero += '0';
    }
    return (zero + num).slice(-digit);
  }

  clockRunning(): void {
    let currentTime: any = new Date()
    let timeElapsed: Date = new Date(currentTime - this.timeBegan - this.stoppedDuration)
    let hour = timeElapsed.getUTCHours()
    let min = timeElapsed.getUTCMinutes()
    let sec = timeElapsed.getUTCSeconds();
    this.time =
      this.zeroPrefix(hour, 2) + ":" +
      this.zeroPrefix(min, 2) + ":" +
      this.zeroPrefix(sec, 2);
  };

}
