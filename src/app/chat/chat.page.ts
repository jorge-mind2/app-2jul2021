import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, AlertController, ModalController, NavController } from '@ionic/angular';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { CalendarModalOptions } from 'ion2-calendar';
import { CometChatService } from '../comet-chat.service';
import { AuthService } from '../api-services/auth.service';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {

  conversation: any[] = [];
  phone_model: string = 'iPhone';
  input: string = '';
  loginType: string = '';
  receiverUID: string = '';
  ccUser: any
  therapist: any
  patient: any = {}
  loggedUser: any = {
    therapist: {},
  }
  receiverName: string

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private androidPermissions: AndroidPermissions,
    private cometchat: CometChatService,
    private auth: AuthService
  ) {
    this.route.queryParams.subscribe(params => {
      this.loginType = params.type;
      this.receiverUID = params.receiverId.toLowerCase();
      if (this.router.getCurrentNavigation().extras.state) {
        this.therapist = this.router.getCurrentNavigation().extras.state.therapist
        this.patient = this.router.getCurrentNavigation().extras.state.patient
      }
    })
  }

  async ngOnInit() {
    if (this.platform.is('cordova') && this.platform.is('android')) {
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

      this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.CAMERA,
        this.androidPermissions.PERMISSION.CAPTURE_AUDIO_OUTPUT,
        this.androidPermissions.PERMISSION.RECORD_AUDIO
      ]);
    }

    window.addEventListener('resize', () => {
      this.scrollToBottom()
    });

    // get cometchat logged user
    this.ccUser = await CometChat.getLoggedinUser()
    this.loggedUser = await this.auth.getCurrentUser()
    this.loginType = this.loggedUser.role.name || this.loginType;
    if (this.loginType == 'therapist') this.cometchat.initCallListener(this.receiverUID)

    this.receiverName = this.loginType == 'patient' ?
      `${this.loggedUser.therapist.name} ${this.loggedUser.therapist.last_name}` :
      `${this.patient.name} ${this.patient.last_name}`

    this.getLastConversation();


    // init listener cometchat
    CometChat.addMessageListener(
      this.receiverUID,
      new CometChat.MessageListener({
        onTextMessageReceived: (message: CometChat.TextMessage) => {
          console.log("Message received successfully:", message);
          this.handlerMessage(message, 0)
        }
      })
    );

  }

  ngOnDestroy() {
    if (this.loginType == 'therapist') this.cometchat.removeCallListener(this.receiverUID);
  }

  private async getLastConversation() {
    const messages: any[] = await this.cometchat.getConversation(this.receiverUID)
    console.log(messages);

    this.conversation = messages.filter((message: CometChat.BaseMessage): any => message.getType() == 'text').map((msg: CometChat.TextMessage) => {
      return {
        text: msg.getText(),
        senderType: this.ccUser.uid == msg.getSender().getUid() ? 1 : 0,
        sender: msg.getSender().getName(),
        image: `assets/${msg.getSender().getRole()}.png`
      }
    })
    setTimeout(() => {
      this.scrollToBottom()
    }, 10)
  }

  public async sendChatMessage() {
    if (this.input.replace(/\s/g, '').length <= 0) return
    const receiverID = this.receiverUID;
    const messageText = this.input;
    const receiverType = CometChat.RECEIVER_TYPE.USER;
    this.input = ''
    const textMessage = new CometChat.TextMessage(receiverID, messageText, receiverType);
    const newMessage: any = await CometChat.sendMessage(textMessage)
    this.handlerMessage(newMessage, 1)
  }


  private handlerMessage(message: CometChat.TextMessage, senderType: number): void {
    this.conversation.push({
      text: message.getText(),
      sender: message.getSender().getName(),
      senderType,
      image: `assets/${message.getSender().getRole()}.png`
    });
    setTimeout(() => {
      this.scrollToBottom()
    }, 10)
  }


  /**
   * Init CometChat video Call
  */
  private initVideoCall() {
    this.cometchat.initVideoCall(this.receiverUID)
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
        cssClass: 'text-primary',
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
      component: NextAppointmentComponent,
      componentProps: {
        patient: this.patient,
        therapist: this.therapist
      }
    });
    return await modal.present()
  }

  public navigateHome() {
    const userType = this.auth.getUserType()
    let home = userType == 'therapist' ? 'home-therapist' : 'home'
    this.navCtrl.navigateBack(home)
  }

}