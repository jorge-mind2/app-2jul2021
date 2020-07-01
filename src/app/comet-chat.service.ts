import { Injectable } from '@angular/core';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { NavController, AlertController, ModalController, LoadingController } from '@ionic/angular';
import { IncomingCallComponent } from './incoming-call/incoming-call.component';
import { AuthService } from './api-services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CometChatService {

  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private auth: AuthService
  ) { }

  public async login(user: any): Promise<CometChat.User> {
    const logged = await CometChat.login(user.ccUser.auth_token)
    if (user.therapist) {
      this.initCallListener(user.therapist.cometChatId)
    }
    return logged
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
          __self.loadingCtrl.dismiss().then(async () => await __self.startCall(sessionID))
        },
        async onOutgoingCallRejected(call: CometChat.Call) {
          // Paciente rechazó la llamada - terapeuta ve alerta de llamada no contestada
          console.log("Outgoing call rejected:", call);
          __self.loadingCtrl.dismiss()
          await __self.notAnsweredAlert()
        },
        async onIncomingCallCancelled(call: CometChat.Call) {
          // Paciente no contestó llamada - terapeuta ve alerta de llamada no contestada
          console.log("Incoming call calcelled:", call);
          if (__self.auth.getUserType() == 'patient') await __self.modalCtrl.dismiss({ awnser: false })
          else if (__self.auth.getUserType() == 'therapist') await __self.loadingCtrl.dismiss()
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

  private async acceptCall(sessionID: string): Promise<boolean> {
    await CometChat.acceptCall(sessionID)
    return this.startCall(sessionID)
  }

  private startCall(sessionID: string): Promise<boolean> {
    return this.navCtrl.navigateForward('video-call', { queryParams: { sessionID } })
  }

  async getConversation(receiverUID: string): Promise<CometChat.BaseMessage[] | []> {
    return await new CometChat.MessagesRequestBuilder()
      .setLimit(50)
      .setUID(receiverUID)
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
    console.log(data);
    if (data.answer) {
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

  async presentCallingWaitScreen() {
    const loading = await this.loadingCtrl.create({
      cssClass: 'custom-loading',
      message: 'Llamando...'
    })
    await loading.present();
  }
}
