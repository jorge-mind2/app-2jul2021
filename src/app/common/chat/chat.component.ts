import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { ApiService } from 'src/app/api-services/api.service';
import { StorageService } from 'src/app/api-services/storage.service';
import { TwilioService } from 'src/app/api-services/twilio.service';

@Component({
  selector: 'chat-component',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input('receiver') receiver
  @Input('sender') sender
  @ViewChild(IonContent, { read: IonContent }) chatBox: IonContent;
  messages: any[] = [];
  phone_model: string = 'iPhone';
  input: string = '';
  receiverUID: string = '';
  ccUser: any
  loggedUser: any = {
    therapist: {},
  }
  loginType: string
  receiverName: string
  receiverPhoto: string
  senderPhoto: string
  isTyping: boolean = false
  receiverConnected = false
  moment = moment
  isSupportChat: boolean = false

  constructor(
    private twilioService: TwilioService,
    private storage: StorageService,
    private router: Router,
    private api: ApiService
  ) {
  }

  async ngOnInit() {
    this.isSupportChat = this.router.url.includes('/support')
    // console.log('receiver', this.receiver);
    // console.log('sender', this.sender);
    this.loggedUser = await this.storage.getCurrentUser()
    this.loginType = this.loggedUser.role.name
    // this.twilioService.login().then(async () => {
    const chatId = await this.storage.getCurrentChatId()
    console.log('chatId', chatId);
    const messages = await this.twilioService.retrieveMessages(chatId)
    this.prepareChat(messages)
    // })
  }

  prepareChat(messages) {
    // console.log(this.loggedUser);
    if (this.loginType == 'patient') {
      this.receiverPhoto = this.isSupportChat ? 'assets/support.png' : this.api.getPhotoProfile(this.loggedUser.therapist)
      this.senderPhoto = this.api.getPhotoProfile(this.loggedUser)
      this.receiverName = this.loggedUser.therapist.name
    } else if (this.loginType == 'therapist') {
      this.receiverPhoto = this.api.getPhotoProfile(this.receiver)
      this.senderPhoto = this.api.getPhotoProfile(this.loggedUser)
      this.receiverName = this.receiver.name
    }

    this.messages = messages.items.map(message => this.parseMessage(message))
    this.twilioService.newMessage.subscribe(newMessage => this.handlerMessage(this.parseMessage(newMessage)))
    const typingBox = document.getElementById('is-typing-message')
    this.twilioService.isTyping.subscribe(async typing => {
      this.setRecieverStatus(true)
      if (typing) {
        typingBox.classList.remove('hide')
      } else {
        typingBox.classList.add('hide')
      }
      console.log('chat member typing', this.isTyping);
    })
    this.twilioService.onUserConnect.subscribe(async connected => this.onReceiverConnectionChange(connected))
    setTimeout(() => {
      this.scrollToBottom()
    }, 10)

    window.addEventListener('resize', () => {
      this.scrollToBottom()
    })
  }

  parseMessage(message) {
    if (!message) return
    const senderType = this.loggedUser.email == message.author ? 1 : 0
    const sender = this.loggedUser.email == message.author ? `${this.loggedUser.name} ${this.loggedUser.last_name}` : `${this.receiver.name} ${this.receiver.last_name}`
    const parsedMessage = {
      sender,
      sentAt: message.dateCreated,
      text: message.body,
      senderType,
      image: senderType == 1 ? this.senderPhoto : this.receiverPhoto,
    }
    return parsedMessage;
  }

  onReceiverConnectionChange(connected) {
    console.log(this.receiverConnected);
    this.setRecieverStatus(connected)
  }

  setRecieverStatus(connected) {
    // this.receiverConnected = connected
    const indicators = document.querySelectorAll('.online-indicator')
    for (const indicator of Array.from(indicators)) {
      if (connected) {
        indicator.classList.add('online')
        indicator.classList.remove('offline')
      } else {
        indicator.classList.add('offline')
        indicator.classList.remove('online')
      }
    }
  }

  ngOnDestroy() {
    console.log('chat destroyed');
    this.twilioService.leaveChannel()
    window.removeEventListener('resize', () => { })
  }

  private async scrollToBottom(duration: number = 300) {
    let content = window.document.getElementById("chat-container");
    let parent = window.document.getElementById("chat-parent");
    await this.chatBox.scrollToBottom(duration)
  }

  sendTyping() {
    console.log('send typing...');
    return this.twilioService.sendTyping()
  }

  public async sendChatMessage() {
    if (this.input.replace(/\s/g, '').length <= 0) return
    const messageText = this.input;
    this.input = ''
    if (await this.twilioService.sendMessage(messageText)) {
      const notif = {
        text: messageText,
        receiverId: this.receiver.id
      }
      const newnotification = await this.api.sendChatMessagePush(notif, this.loginType)
      console.log('newnotification', newnotification);

    } else {
      //handleError
    }
  }


  private handlerMessage(message: any): void {
    if (!message || message == '' || (message.text && message.text.replace(/\s/g, '').length <= 0)) return
    this.messages.push(message);
    setTimeout(() => {
      this.scrollToBottom()
    }, 10)
  }


  printDate(time1, time2?) {
    if (time2) {
      if (new Date(time1).getDate() - new Date(time2).getDate()) {
        return new Date(time1).toLocaleDateString();
      }
    } else {
      return new Date(time1).toLocaleDateString();
    }
    return undefined;
  }


}
