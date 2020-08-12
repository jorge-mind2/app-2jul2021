import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform, AlertController, ModalController, NavController, ToastController, PopoverController, Events } from '@ionic/angular';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ActivatedRoute, Router } from '@angular/router';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { CalendarModalOptions } from 'ion2-calendar';
import { CometChatService } from '../comet-chat.service';
import { AuthService } from '../api-services/auth.service';
import { NextAppointmentComponent } from '../common/next-appointment/next-appointment.component';
import { ApiService } from '../api-services/api.service';
import { StorageService } from '../api-services/storage.service';
import { OptionsComponent } from './options/options.component';
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
  receiverPhoto: string
  senderPhoto: string
  defaultBackHref: string = 'home'
  constructor(
    private platform: Platform,
    private events: Events,
    private androidPermissions: AndroidPermissions,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private cometchat: CometChatService,
    private storageService: StorageService,
    private auth: AuthService,
    private api: ApiService
  ) {
    this.route.queryParams.subscribe(params => {
      this.loginType = params.type;
      if (this.loginType == 'therapist') this.defaultBackHref = 'home-therapist'
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

    if (this.loginType == 'patient') {
      this.receiverPhoto = this.loggedUser.therapist.photo
        ? this.api.getPhotoProfile(this.loggedUser.therapist.photo)
        : 'assets/therapist.png'
      this.senderPhoto = this.loggedUser.photo
        ? this.api.getPhotoProfile(this.loggedUser.photo)
        : 'assets/patient.png'
      this.receiverName = this.loggedUser.therapist.name
    } else if (this.loginType == 'therapist') {
      this.receiverPhoto = this.patient.photo
        ? this.api.getPhotoProfile(this.patient.photo)
        : 'assets/patient.png'
      this.senderPhoto = this.loggedUser.photo
        ? this.api.getPhotoProfile(this.loggedUser.photo)
        : 'assets/therapist.png'
      this.receiverName = this.patient.name
    }

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
    this.cometchat.removeCallListener(this.receiverUID);
  }

  private async getLastConversation() {
    const messages: any[] = await this.cometchat.getConversation(this.receiverUID)
    console.log(messages);
    const type = this.loginType == 'therapist' ? 'patient' : 'therapist'
    const selectedMessage = messages.find((message: CometChat.TextMessage) => message.getSender().getRole() == type)
    if (selectedMessage) this.storageService.setUnreadMessages(selectedMessage, false)

    this.conversation = messages.filter((message: CometChat.BaseMessage): any => message.getType() == 'text').map((msg: CometChat.TextMessage) => {
      return {
        text: msg.getText(),
        senderType: this.ccUser.uid == msg.getSender().getUid() ? 1 : 0,
        sender: msg.getSender().getName(),
        image: this.ccUser.uid == msg.getSender().getUid() ? this.senderPhoto : this.receiverPhoto
      }
    })
    setTimeout(() => {
      this.scrollToBottom()
    }, 50)
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
      image: senderType == 1 ? this.senderPhoto : this.receiverPhoto
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

  async presentCallAlert() {
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

  async presentOptions(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: OptionsComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();
    return this.events.subscribe('onSelectOption', selected => {
      if (selected == 'session_price') {
        this.presentPricePrompt()
      }
      this.events.unsubscribe('onSelectOption')
      this.popoverCtrl.dismiss()
    })
  }

  async presentPricePrompt() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      message: `Elige el costo por sesión para ${this.patient.name}. (Sólo se puede cambiar 1 vez)`,
      inputs: [
        {
          name: 'price',
          type: 'number',
          value: this.patient.session_price || 400,
          placeholder: 'Costo por sesión',
          disabled: this.patient.session_price > 0,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Aceptar',
          handler: (promptData) => {
            console.log('Confirm Ok');
            this.saveSessionPrice(promptData.price)
          }
        }
      ]
    });

    await alert.present();
  }

  async saveSessionPrice(newPrice) {
    if (this.patient.session_price && this.patient.session_price > 0) return
    try {
      const setedPrice = await this.api.setUserSessionPrice(this.patient.id, newPrice)
      this.patient.session_price = newPrice
      console.log('setedPrice', setedPrice);
      this.presentToast('Guardado')
    } catch (error) {
      console.log(error);
    }
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

  public async navigateHome() {
    const userType = await this.auth.getUserType()
    let home = userType == 'therapist' ? 'home-therapist' : 'home'
    this.navCtrl.navigateBack(home)
  }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

}