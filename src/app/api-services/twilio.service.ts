import { ElementRef, Injectable } from '@angular/core';
import { NavController, AlertController, ModalController, LoadingController } from '@ionic/angular';
import * as TwilioVideo from 'twilio-video';
import * as TwilioChat from 'twilio-chat';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { Channel } from 'twilio-chat/lib/channel';
import { Paginator } from 'twilio-chat/lib/interfaces/paginator';
import { Message } from 'twilio-chat/lib/message';
import { IncomingCallComponent } from '../incoming-call/incoming-call.component';
import { OutcomingCallComponent } from '../outcoming-call/outcoming-call.component';

@Injectable({
  providedIn: 'root'
})
export class TwilioService {
  newMessage = new BehaviorSubject(null);
  isTyping = new BehaviorSubject(false);
  onUserConnect = new BehaviorSubject(null);
  remoteVideo: ElementRef;
  localVideo: ElementRef;
  loading: any;

  previewing: boolean;
  room: any;

  client: TwilioChat.Client
  channel: Channel
  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    public storage: StorageService,
  ) {
  }

  async login(pushChannel?, registerForPushCallback?, showPushCallback?) {
    const token = await this.getToken(pushChannel)
    // console.log('Token', token)
    this.client = await TwilioChat.Client.create(token, { 'logLevel': 'info' })
    console.log('chatClient', this.client)
    const loggedUser = await this.client.user
    console.log(loggedUser);

    this.client.on('tokenAboutToExpire', () => {
      console.log('this', 'tokenAboutToExpire');
      return this.getToken(pushChannel)
        .then(newToken => this.storage.setChatVideoToken(newToken))
    });
    this.client.on('tokenExpired', () => {
      this.login(pushChannel, registerForPushCallback, showPushCallback);
    });
    this.client.on('pushNotification', (obj) => {
      if (obj && showPushCallback) {
        showPushCallback()
      }
    });
    this.subscribeToAllChatClientEvents();
    if (registerForPushCallback) {
      registerForPushCallback();
    }
  }

  async logout() {
    await this.leaveChannel()
    this.channel = null
    return this.client.shutdown()
  }

  async getToken(pushChannel?) {
    if (!pushChannel) {
      pushChannel = 'none';
    }
    return await this.storage.getChatVideoToken()
  }

  subscribeToAllChatClientEvents() {
    this.client.on('userSubscribed', () => {
      console.log('userSubscribed')
    })
    this.client.on('userUpdated', () => {
      console.log('userUpdated')
    })
    this.client.on('userUnsubscribed', () => {
      console.log('userUnsubscribed')
    })
    this.client.on('channelAdded', channel => {
      console.log('channelAdded', channel.uniqueName)
    })
    this.client.on('channelRemoved', () => {
      console.log('channelRemoved')
    })
    this.client.on('channelInvited', () => {
      console.log('channelInvited')
    })
    this.client.on('channelJoined', channel => {
      channel
      console.log('channelJoined', channel.uniqueName)
    })
    this.client.on('channelLeft', channel => {
      console.log('channelLeft', channel.uniqueName)
    })
    this.client.on('channelUpdated', () => {
      console.log('channelUpdated')
    })
    this.client.on('memberJoined', member => {
      console.log('memberJoined', member.identity)
    })
    this.client.on('memberLeft', member => {
      console.log('memberLeft', member.identity)
    })
    this.client.on('memberUpdated', member => {
      console.log('memberUpdated', member.identity)
    })
    this.client.on('messageAdded', message => {
      console.log('messageAdded', message)
    })
    this.client.on('messageUpdated', message => {
      console.log('messageUpdated', message)
    })
    this.client.on('messageRemoved', message => {
      console.log('messageRemoved', message)
    })
    this.client.on('typingStarted', typing => {
      console.log('typingStarted', typing)
    })
    this.client.on('typingEnded', typing => {
      console.log('typingEnded', typing)
    })
    this.client.on('connectionError', () => {
      console.log('connectionError')
    })
    this.client.on('connectionStateChanged', status => {
      console.log('connectionStateChanged', status)
    })
    this.client.on('pushNotification', () => {
      console.log('onPushNotification')
    })
  }

  handlePushNotification(data) {
    if (this.client !== null) {
      this.client.handlePushNotification(data);
      return null;
    } else {
      return TwilioChat.Client.parsePushNotification(data);
    }
  }


  async sendMessage(message): Promise<number> {
    return await this.channel.sendMessage(message, {})
  }

  async retrieveMessages(chatId): Promise<Paginator<Message>> {
    await this.connectToChannel(chatId)
    this.channel.getMembers().then(async members => console.log('members', await members[0].getUser()))
    const messages = await this.channel.getMessages(80)
    return messages
  }

  async connectToChannel(chatId) {
    const subscribedChannel = await this.client.getChannelByUniqueName(chatId)
    console.log('subscribedChannel', subscribedChannel);
    this.channel = subscribedChannel
    if (!this.channel) {
      const channel = await this.getChannel(chatId)
      if (!this.channel || (this.channel && channel.uniqueName != this.channel.uniqueName)) {
        this.channel = channel
      }
    }
    return this.leaveChannel().then(async () => {
      await this.channel.join()
      return this.initChannelEvents()
    })
  }

  initChannelEvents() {
    console.log(this.channel.friendlyName + ' ready.');
    this.channel.on('messageAdded', message => this.addMessageToList(message));
    this.channel.on('typingStarted', member => this.showTypingStarted(member));
    this.channel.on('typingEnded', member => this.hideTypingStarted(member));
    this.channel.on('memberJoined', member => this.notifyMemberJoined(member));
    this.channel.on('memberLeft', member => this.notifyMemberLeft(member));
  }

  leaveChannel() {
    if (this.channel) {
      return this.channel.leave().then((leftChannel: Channel) => {
        leftChannel.removeAllListeners('messageAdded');
        leftChannel.removeAllListeners('typingStarted');
        leftChannel.removeAllListeners('typingEnded');
        leftChannel.removeAllListeners('memberJoined');
        leftChannel.removeAllListeners('memberLeft');
      });
    }
    else {
      return Promise.resolve();
    }
  }

  sendTyping() {
    return this.channel.typing()
  }

  addMessageToList(message) {
    console.log('new Message', message)
    return this.newMessage.next(message)
  };

  notifyMemberJoined(member) {
    const notification = (member.identity + ' joined the channel')
    console.log(notification);
    this.onUserConnect.next(true)
  }

  notifyMemberLeft(member) {
    const notification = (member.identity + ' left the channel');
    console.log(notification);
    this.onUserConnect.next(false)
  }

  showTypingStarted(member) {
    this.isTyping.next(true)

  }

  hideTypingStarted(member) {
    this.isTyping.next(false)
  }

  async getChannel(chatId): Promise<Channel> {
    // channel name = CurrentUserId_chat_receiverUserId
    const name = `${chatId}`
    let existingChannel: Channel;
    const publicPaginator = await this.client.getPublicChannelDescriptors()
    console.log('Public Channel Paginator', publicPaginator);
    for (let i = 0; i < publicPaginator.items.length; i++) {
      const channel = publicPaginator.items[i];
      console.log('Public Channel: ' + channel.friendlyName);
      if (channel.uniqueName == name) {
        existingChannel = await channel.getChannel()
        break
      }
    }
    if (!existingChannel) {
      const paginator = await this.client.getUserChannelDescriptors()
      console.log('User Channel Paginator', paginator);
      for (let i = 0; i < paginator.items.length; i++) {
        var channel = paginator.items[i];
        console.log('User Channel: ' + channel.friendlyName);
        if (channel.uniqueName == name) {
          existingChannel = await channel.getChannel()
          break
        }
      }
    }
    if (existingChannel) return existingChannel
    const newChannel = await this.createChannel(name, name)
    return newChannel
  }

  private async createChannel(uniqueName: string = 'general', friendlyName: string): Promise<Channel> {
    // Create a Channel
    const channel = await this.client.createChannel({
      uniqueName,
      friendlyName
    })
    console.log('Created general channel:');
    console.log(channel);
    return channel
  }


  connectToRoom(accessToken: string, options): void {
    TwilioVideo.connect(accessToken, options).then(room => {
      console.log(room);
      this.room = room

      console.log(`Successfully joined a Room: ${room}`);
      if (!this.previewing && options['video']) {
        this.startLocalVideo();
        this.previewing = true;
      }


      // Attach the Participant's Media to a <div> element.
      room.on('participantConnected', participant => {
        console.log(participant);
        console.log(`Participant "${participant.identity}" connected`);

        participant.tracks.forEach(publication => {
          console.log('participant track:', publication);

          if (publication.isSubscribed) {
            const track = publication.track;
            this.remoteVideo.nativeElement.appendChild(track.attach());
          }
        });

        participant.on('trackSubscribed', track => {
          this.remoteVideo.nativeElement.appendChild(track.attach());
        });
      });

      // Log your Client's LocalParticipant in the Room
      const localParticipant = room.localParticipant;
      console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);

      // Log any Participants already connected to the Room
      room.participants.forEach(participant => {
        console.log(`Participant "${participant.identity}" is connected to the Room`);
        participant.on('trackSubscribed', track => {
          this.remoteVideo.nativeElement.appendChild(track.attach());
        });

      });

      // Log new Participants as they connect to the Room
      room.once('participantConnected', participant => {
        console.log(`Participant "${participant.identity}" has connected to the Room`);
      });

      // Log Participants as they disconnect from the Room
      room.once('participantDisconnected', participant => {
        console.log(`Participant "${participant.identity}" has disconnected from the Room`);
      });



    }, error => {
      console.error(`Unable to connect to Room: ${error.message}`);
    });
  }

  startLocalVideo(): void {
    TwilioVideo.createLocalVideoTrack().then(track => {
      this.localVideo.nativeElement.appendChild(track.attach());
    });
  }

  private async acceptCall(sessionID: string): Promise<void> {
    /* const newCall = await CometChat.acceptCall(sessionID)
    setTimeout(async () => {
      return this.startCall(newCall.getSessionId())
    }, 3000); */
  }

  private async startCall(sessionID: string): Promise<boolean> {
    return await this.navCtrl.navigateForward(['video-call'], { queryParams: { sessionID }, queryParamsHandling: "merge" }).finally(async () => {
      if (await this.loadingCtrl.getTop()) this.loadingCtrl.dismiss()
    })
  }

  async rejectCall(sessionID: string): Promise<any> {
    /* var status = CometChat.CALL_STATUS.REJECTED;

    const rejected = await CometChat.rejectCall(sessionID, status)
    console.log({ rejected });

    return rejected */
  }

  async cancelCall(sessionID: string): Promise<any> {
    /* var status = CometChat.CALL_STATUS.CANCELLED;

    const cancelled = await CometChat.rejectCall(sessionID, status)
    console.log({ cancelled });

    return cancelled */
  }

  async presentIncomingCallScreen(call): Promise<void> {
    const caller = call.getSender()
    const sessionID = call.getSessionId()
    const modal = await this.modalCtrl.create({
      component: IncomingCallComponent,
      componentProps: {
        caller
      },
      keyboardClose: false,
    });
    await modal.present()
    const { data } = await modal.onDidDismiss();
    if (data.answered) {
      await this.presentLoading('Conectando...')
      this.acceptCall(sessionID)
    } else {
      this.rejectCall(sessionID)
    }
  }

  async presentOutcomingCallScreen(call: any): Promise<void> {
    const receiver = call.getReceiver()
    const sessionID = call.getSessionId()
    const modal = await this.modalCtrl.create({
      component: OutcomingCallComponent,
      componentProps: {
        receiver
      },
      keyboardClose: false,
    });
    await modal.present()
    const { data } = await modal.onDidDismiss();
    if (data.cancelled) {
      this.cancelCall(sessionID)
    } else {
      this.acceptCall(sessionID)
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
}
