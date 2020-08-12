import { Injectable } from '@angular/core';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { NavController, AlertController, ModalController, LoadingController } from '@ionic/angular';
import { IncomingCallComponent } from './incoming-call/incoming-call.component';
import { AuthService } from './api-services/auth.service';
import { COMETCHAT } from './keys';
import { PushNotificationsService } from './api-services/push-notifications.service';

@Injectable({
  providedIn: 'root'
})
export class CometChatService {
  CometChatAppId = COMETCHAT.APPID
  loading: any
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private auth: AuthService,
    private push: PushNotificationsService
  ) {
  }

  public initializeCometChat() {
    const region = "US";
    const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();
    CometChat.init(this.CometChatAppId, appSetting).then(
      () => {
        console.log("CometChat Initialization completed successfully");
        // You can now call login function.
        this.auth.getCurrentUser().then(async usr => {
          if (usr) await this.login(usr)
        })

      },
      error => {
        console.log("Initialization failed with error:", error);
        // Check the reason for error and take appropriate action.
      }
    );
  }


  public async login(user: any): Promise<CometChat.User> {
    const logged = await CometChat.login(user.ccUser.auth_token)
    console.log('CometChat USER LOGGED', logged);
    this.subscribeToCurrentUser(logged.getUid())
    if (user.therapist) {
      this.initCallListener(user.therapist.name)
    }
    return logged
  }

  async subscribeToCurrentUser(UID: string) {
    const FCMToken = await this.push.getFCMToken()
    console.log('FCMToken', FCMToken);
    CometChat.getAppSettings().then((settings: any) => {
      var appToken;
      if (settings.extensions) {
        settings.extensions.forEach(ext => {
          if (ext.id == "push-notification") {
            appToken = ext.appToken;
          }
        });
      }
      var userType = "user";
      var region = "US";
      var appId = this.CometChatAppId;
      var topic = appId + "_" + userType + "_" + UID;
      var url =
        "https://push-notification-" + region + ".cometchat.io/v1/subscribe?appToken=" +
        appToken +
        "";
      fetch(url, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({ appId: appId, fcmToken: FCMToken, topic: topic })
      })
        .then(response => {
          if (response.status < 200 || response.status >= 400) {
            console.log(
              "Error subscribing to topic: " +
              response.status +
              " - " +
              response.text()
            );
          }
          console.log('Subscribed to "' + topic + '"');
        })
        .catch(error => {
          console.error(error);
        });
    });
  }

  public initCallListener(listnerID) {
    console.log('init cometchat listener');

    const __self = this;
    CometChat.addCallListener(
      listnerID,
      new CometChat.CallListener({
        async onIncomingCallReceived(call) {
          // Paciente recibe la llamada - terapeuta está esperando respuesta
          console.log("Incoming call:", call);
          const sessionID = call.sessionId;
          console.log({ sessionID, call });
          await __self.presentIncomingCallScreen(call)
        },
        async onOutgoingCallAccepted(call) {
          // Paciente aceptó la llamada - terapeuta inicia la llamada
          console.log("Outgoing call accepted:", call);
          var sessionID = call.sessionId;
          await __self.startCall(sessionID)
        },
        async onOutgoingCallRejected(call: CometChat.Call) {
          // Paciente rechazó la llamada - terapeuta ve alerta de llamada no contestada
          console.log("Outgoing call rejected:", call);
          __self.loadingCtrl.dismiss()
          if (call.getAction() == "rejected" || call.getStatus() == "rejected") await __self.notAnsweredAlert()
        },
        async onIncomingCallCancelled(call: CometChat.Call) {
          // Paciente no contestó llamada - terapeuta ve alerta de llamada no contestada
          console.log("Incoming call calcelled:", call);
          if (await __self.auth.getUserType() == 'patient') await __self.modalCtrl.dismiss({ awnser: false })
          else if (await __self.auth.getUserType() == 'therapist') await __self.loadingCtrl.dismiss()
          await __self.notAnsweredAlert()
        }
      })
    );
  }

  removeCallListener(receiverUID: string): void {
    return CometChat.removeCallListener(receiverUID)
  }

  async initVideoCall(receiverUID: string) {
    await this.presentCallingWaitScreen()
    const callType = CometChat.CALL_TYPE.VIDEO;
    const receiverType = CometChat.RECEIVER_TYPE.USER;

    const call = new CometChat.Call(receiverUID, callType, receiverType)
    const outGoingCall = await CometChat.initiateCall(call)
  }

  private async acceptCall(sessionID: string): Promise<void> {
    const newCall = await CometChat.acceptCall(sessionID)
    setTimeout(async () => {
      return this.startCall(newCall.getSessionId())
    }, 3000);
  }

  private async startCall(sessionID: string): Promise<boolean> {
    return await this.navCtrl.navigateForward(['video-call'], { queryParams: { sessionID }, queryParamsHandling: "merge" }).finally(() => this.loadingCtrl.dismiss())
  }

  async getConversation(receiverUID: string): Promise<CometChat.BaseMessage[] | []> {
    return await new CometChat.MessagesRequestBuilder()
      .setLimit(100)
      .setUID(receiverUID)
      .setType('text')
      .build().fetchPrevious()
  }

  async rejectCall(sessionID: string): Promise<CometChat.Call> {
    var status = CometChat.CALL_STATUS.REJECTED;

    const rejected = await CometChat.rejectCall(sessionID, status)
    console.log({ rejected });

    return rejected
  }

  async presentIncomingCallScreen(call: CometChat.Call): Promise<void> {
    const caller = call.getSender()
    const sessionID = call.getSessionId()
    const modal = await this.modalCtrl.create({
      component: IncomingCallComponent,
      componentProps: {
        caller
      },
      keyboardClose: false
    });
    await modal.present()
    const { data } = await modal.onDidDismiss();
    if (data.answer) {
      await this.presentLoading('Conectando...')
      this.acceptCall(sessionID)
    } else {
      this.rejectCall(sessionID)
    }
  }

  async notAnsweredAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Cancelada',
      message: 'Llamada no contestada.',
      backdropDismiss: false,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'secondary'
      }]
    });

    alert.present();
  }

  async presentLoading(message: string) {
    this.loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message
    })
    await this.loading.present();
  }

  async presentCallingWaitScreen() {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message: 'Llamando...'
    })
    await loading.present();
  }
}
