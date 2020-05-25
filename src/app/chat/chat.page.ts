/**
 *  ToDo
 *
 * Manejar eventos de chat
 * Pasar permisos de cámara y mic a video-call componen
 * En video-call component:
 *  manejar eventos de conexión a llamada
 *  Poner cron que inicie cuando se conecte el paciente
 *
 *
 *
 *  */
import { Component, OnInit } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ActivatedRoute } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  conversation = [
    /* { text: 'Right, it totally blew my mind', sender: 1, image: 'assets/sg1.jpg', read: true, delivered: true, sent: true },
    { text: 'Hey, that\'s an awesome chat UI', sender: 0, image: 'assets/sg2.jpg' },
    { text: 'Yes, totally free', sender: 1, image: 'assets/sg1.jpg', read: true, delivered: true, sent: true },
    { text: 'And it is free ?', sender: 0, image: 'assets/sg2.jpg' },
    { text: 'Wow, that\'s so cool', sender: 0, image: 'assets/sg2.jpg' } */

  ]
  phone_model = 'iPhone';
  input = '';
  loginType = '';
  receiverUID = '';
  ccUser;

  constructor(
    private platform: Platform,
    public alertController: AlertController,
    private route: ActivatedRoute,
    private androidPermissions: AndroidPermissions
  ) {
    this.route.queryParams.subscribe(params => {
      this.loginType = params.type;
      this.receiverUID = this.loginType == 'therapist' ? 'patient01' : 'therapista01';
    })
  }

  async ngOnInit() {

    if (this.platform.is('android')) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT)
      );

      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO).then(
        result => console.log('Has permission?', result.hasPermission),
        err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.RECORD_AUDIO)
      );

      this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.CAMERA, this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT, this.androidPermissions.PERMISSION.RECORD_AUDIO]);
    }







    /** Aquí se debe obtener el terapeuta relacionado al paciente o viceversa para obtener su cometChatId y setearlo como receptor  */

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
          this.conversation.push({ text: message.text, sender: 0, image: this.loginType == 'therapist' ? 'assets/patient.png' : 'assets/therapist.png' });
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
    let messagesRequest = new CometChat.MessagesRequestBuilder()
      .setLimit(50)
      .setUID(this.receiverUID)
      .build();

    messagesRequest.fetchPrevious().then(
      (messages: any[]) => {
        console.log("Message list fetched:", messages);
        // Handle the list of messages
        this.conversation = messages.filter(message => message.getType() == 'text').map(msg => {
          // let isLocal = (this.ccUser.role == 'therapist' && this.loginType == 'therapist' && msg.) || (this.ccUser.role == 'patient' && this.loginType == 'patient')
          return {
            text: msg.text,
            sender: this.ccUser.uid == msg.sender.uid ? 1 : 0,
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

  send() {
    if (this.input != '') {
      this.conversation.push({ text: this.input, sender: 1, image: 'assets/sg1.jpg' });
      this.input = '';
      setTimeout(() => {
        this.scrollToBottom()
      }, 10)
    }
  }

  sendChatMessage() {
    const receiverID = this.receiverUID;
    const messageText = this.input;
    const receiverType = CometChat.RECEIVER_TYPE.USER;

    const textMessage = new CometChat.TextMessage(receiverID, messageText, receiverType);

    CometChat.sendMessage(textMessage).then(
      message => {
        console.log("Message sent successfully:", message);
        // Do something with message
        this.conversation.push({ text: this.input, sender: 1, image: this.loginType == 'therapist' ? 'assets/therapist.png' : 'assets/patient.png' });
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
  initVideoCall() {
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

  scrollToBottom() {
    let content = document.getElementById("chat-container");
    let parent = document.getElementById("chat-parent");
    let scrollOptions = {
      left: 0,
      top: content.offsetHeight
    }

    parent.scrollTo(scrollOptions)
  }

}
