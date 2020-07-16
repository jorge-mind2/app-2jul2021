import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { AuthService } from '../api-services/auth.service';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.page.html',
  styleUrls: ['../chat/chat.page.scss', './support.page.scss'],
})
export class SupportPage implements OnInit {

  conversation: any[] = [];
  phone_model: string = 'iPhone'
  input: string = ''
  loginType: string = ''
  receiverUID: string = ''
  cometchatUser: any
  currentUser: any
  showAssignmentBtn: boolean = false

  constructor(
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private auth: AuthService,
    private api: ApiService
  ) {
    this.route.queryParams.subscribe(params => {
      this.receiverUID = params.receiverId.toLowerCase();
      // Test
      // this.receiverUID = 'a-516ee1';
    })
  }

  async ngOnInit() {
    // get cometchat logged user
    this.cometchatUser = await CometChat.getLoggedinUser();
    this.auth.getCurrentUser().then(user => this.currentUser = user)
    this.getLastConversation()

    // init listener cometchat
    CometChat.addMessageListener(
      this.receiverUID,
      new CometChat.MessageListener({
        onTextMessageReceived: message => {
          console.log("Message received successfully:", message);
          let action = message.text.match(/<assigned-therapist>/g) ? 'assigned-therapist' : null
          console.log(message.text.match(/<assigned-therapist>/g));
          message.text = message.text.replace(/<assigned-therapist>/g, '')
          if (action == 'assigned-therapist') {
            this.showAssignmentBtn = true
          }
          // Handle text message
          this.conversation.push({
            text: message.text,
            senderType: 0,
            sender: message.getSender(),
            image: this.loginType == 'support' ? 'assets/patient.png' : 'assets/support.png',
            action
          });
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

    messagesRequest.fetchPrevious().then(
      (messages: any[]) => {
        console.log("Message list fetched:", messages);
        // Handle the list of messages
        this.conversation = messages.filter(message => message.getType() == 'text').map(msg => {
          msg.text = msg.text.replace(/<assigned-therapist>/g, '')
          return {
            text: msg.text,
            senderType: this.cometchatUser.uid == msg.sender.uid ? 1 : 0,
            sender: msg.sender,
            image: `assets/${msg.sender.role}.png`,
          }
        })
        const welcomeMessage = {
          text: `Hola ${this.currentUser.name}, bienvenid@ a Mind2! ¿Cómo te podemos ayudar?`,
          senderType: 0,
          sender: {
            name: `${this.currentUser.support.name} ${this.currentUser.support.last_name}`
          },
          image: 'assets/support.png'
        }
        if (this.conversation.length <= 0) {
          this.conversation.push(welcomeMessage);
        } else {
          this.conversation.unshift(welcomeMessage)
        }
        console.log(this.conversation);

      },
      error => {
        console.log("Message fetching failed with error:", error);
      }
    );
  }

  async getMyTherapist() {
    const therapist = await this.api.getMyTherapist(this.currentUser.id)
    this.currentUser.therapist = therapist
    await this.auth.setCurrentUser(this.currentUser).then(() => this.presentAlert(`Ahora tu terapeuta es: ${therapist.name} ${therapist.last_name}`))
    this.showAssignmentBtn = false
    await this.auth.getCurrentUser()
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

  async presentAlert(message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Listo',
      message,
      buttons: [{
        text: 'Aceptar',
        cssClass: 'text-secondary'
      }]
    });

    await alert.present();
  }

  public sendChatMessage() {
    if (this.input.replace(/\s/g, '').length <= 0) return
    const receiverID = this.receiverUID;
    const messageText = this.input;
    const receiverType = CometChat.RECEIVER_TYPE.USER;

    const textMessage = new CometChat.TextMessage(receiverID, messageText, receiverType);

    CometChat.sendMessage(textMessage).then(
      message => {
        console.log("Message sent successfully:", message);
        // Do something with message
        this.conversation.push({
          text: this.input, senderType: 1,
          sender: message.getSender(),
          image: this.loginType == 'support' ? 'assets/support.png' : 'assets/patient.png'
        });
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

  private scrollToBottom() {
    let content = document.getElementById("chat-container");
    let parent = document.getElementById("chat-parent");
    let scrollOptions = {
      left: 0,
      top: content.offsetHeight
    }

    parent.scrollTo(scrollOptions)
  }

}
