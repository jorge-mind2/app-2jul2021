/**
 *  ToDo
 *
 * Manejar eventos de chat
 * Pasar permisos de cámara y mic a video-call componen
 * En video-call component:
 *  manejar eventos de conexión a llamada
 *  Poner timer que inicie cuando se conecte el paciente
 *
 *
 *
 *  */
import { Component, OnInit } from '@angular/core';
import { Platform, AlertController, ModalController } from '@ionic/angular';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { ChooseDateComponent } from '../choose-date/choose-date.component';
import { CalendarModalOptions, CalendarModal } from 'ion2-calendar';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  conversation: any[] = [];
  phone_model: string = 'iPhone';
  input: string = '';
  loginType: string = '';
  receiverUID: string = '';
  ccUser: any
  therapist: any
  patient: any

  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private androidPermissions: AndroidPermissions
  ) {
    this.route.queryParams.subscribe(params => {
      this.loginType = params.type;
      // this.receiverUID = this.loginType == 'therapist' ? 'patient01' : 'therapista01';
      this.receiverUID = params.receiverId.toLowerCase();
      if (this.router.getCurrentNavigation().extras.state) {
        this.therapist = this.router.getCurrentNavigation().extras.state.therapist
        this.patient = this.router.getCurrentNavigation().extras.state.patient
      }
    })
  }

  async ngOnInit() {

    if (this.platform.is('android')) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT)
      );

      /* this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT, this.androidPermissions.PERMISSION.RECORD_AUDIO]); */
    }

    // get cometchat logged user
    this.ccUser = await CometChat.getLoggedinUser();

    this.getLastConversation();

    // init listener cometchat
    CometChat.addMessageListener(
      this.receiverUID,
      new CometChat.MessageListener({
        onTextMessageReceived: message => {
          console.log("Message received successfully:", message);
          // Handle text message
          this.conversation.push({ text: message.text, senderType: 0, sender: message.getSender(), image: this.loginType == 'therapist' ? 'assets/patient.png' : 'assets/therapist.png' });
          this.input = '';
          setTimeout(() => {
            this.scrollToBottom()
          }, 10)
        }
      })
    );

  }

  ionViewDidEnter() {

    setTimeout(() => {
      this.scrollToBottom()
    }, 10)

  }

  private getLastConversation() {
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setLimit(50)
      .setUID(this.receiverUID)
      .build();

    console.log(this.receiverUID);
    CometChat.getLoggedinUser().then(usr => console.log(usr))

    messagesRequest.fetchPrevious().then(
      (messages: any[]) => {
        console.log("Message list fetched:", messages);
        // Handle the list of messages
        this.conversation = messages.filter(message => message.getType() == 'text').map(msg => {
          // let isLocal = (this.ccUser.role == 'therapist' && this.loginType == 'therapist' && msg.) || (this.ccUser.role == 'patient' && this.loginType == 'patient')
          return {
            text: msg.text,
            senderType: this.ccUser.uid == msg.sender.uid ? 1 : 0,
            sender: msg.sender,
            image: `assets/${msg.sender.role}.png`
          }
        })
        console.log(this.conversation);

      },
      error => {
        console.log("Message fetching failed with error:", error);
      }
    );
  }

  private send() {
    if (this.input != '') {
      this.conversation.push({ text: this.input, senderType: 1, image: 'assets/sg1.jpg' });
      this.input = '';
      setTimeout(() => {
        this.scrollToBottom()
      }, 10)
    }
  }

  private sendChatMessage() {
    if (this.input.replace(/\s/g, '').length <= 0) return
    const receiverID = this.receiverUID;
    const messageText = this.input;
    const receiverType = CometChat.RECEIVER_TYPE.USER;

    const textMessage = new CometChat.TextMessage(receiverID, messageText, receiverType);

    CometChat.sendMessage(textMessage).then(
      message => {
        console.log("Message sent successfully:", message);
        // Do something with message
        this.conversation.push({ text: this.input, senderType: 1, sender: message.getSender(), image: this.loginType == 'therapist' ? 'assets/therapist.png' : 'assets/patient.png' });
        this.input = '';
        setTimeout(() => {
          this.scrollToBottom()
        }, 10)
      },
      error => {
        console.log("Message sending failed with error:", error);
        // Handle any error
      }
    );
  }


  /**
   * Init CometChat video Call
  */
  private initVideoCall() {
    var callType = CometChat.CALL_TYPE.VIDEO;
    var receiverType = CometChat.RECEIVER_TYPE.USER;

    var call = new CometChat.Call(this.receiverUID, callType, receiverType);

    CometChat.initiateCall(call).then(
      outGoingCall => {
        console.log("Call initiated successfully:", outGoingCall);
        // perform action on success. Like show your calling screen.
      },
      error => {
        console.log("Call initialization failed with exception:", error);
      }
    );
  }

  private scrollToBottom() {
    let content = document.getElementById("chat-container");
    let parent = document.getElementById("chat-parent");
    let scrollOptions = {
      left: 0,
      top: content.offsetHeight
    }

    parent.scrollTo(scrollOptions)
  }

  private async presentCallAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Iniciar llamada',
      message: '¿Deseas iniciar la videollamada con tu paciente?',
      backdropDismiss: false,
      buttons: [{
        text: 'Cancelar',
        cssClass: 'text-danger'
      }, {
        text: 'Aceptar',
        cssClass: 'text-tertiary',
        handler: () => this.initVideoCall()
      },]
    })

    alert.present();
  }

  async presentModal() {
    const options: CalendarModalOptions = {
      color: 'primary'
    };
    const modal = await this.modalCtrl.create({
      component: ChooseDateComponent,
      componentProps: {
        patient: this.patient,
        therapist: this.therapist
      }
    });
    return await modal.present()
  }

}
