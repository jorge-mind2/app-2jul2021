import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { AlertController, ModalController, LoadingController, Platform } from '@ionic/angular';
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
  onTwilioConnected: EventEmitter<boolean> = new EventEmitter()
  newMessage: EventEmitter<any> = new EventEmitter()
  isTyping: EventEmitter<boolean> = new EventEmitter(true)
  onUserConnect = new BehaviorSubject(null)
  onCallAccepted: EventEmitter<boolean> = new EventEmitter()
  onChannelUpdated: EventEmitter<any> = new EventEmitter()
  onParticipantConnected: EventEmitter<any> = new EventEmitter()
  remoteVideo: ElementRef<HTMLDivElement>
  localVideo: ElementRef<HTMLDivElement>
  loading: HTMLIonLoadingElement
  public twilioConnected: boolean
  incomingCallModal: HTMLIonModalElement
  outcomingCallModal: HTMLIonModalElement

  previewing: boolean
  room: TwilioVideo.Room

  client: TwilioChat.Client
  channel: Channel
  constructor(
    private platform: Platform,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public storage: StorageService,
  ) {
  }

  async login(pushChannel?) {
    if (this.twilioConnected) {
      return
    }
    try {
      const token = await this.getChatToken()
      this.client = await TwilioChat.Client.create(token, { 'logLevel': 'info' })
      const loggedUser = await this.client.user
      this.twilioConnected = true
      this.onTwilioConnected.emit(true)

      this.client.on('tokenAboutToExpire', () => {
        return this.getChatToken(true)
          .then(newToken => this.storage.setChatToken(newToken))
      });
      this.client.on('tokenExpired', () => {
        this.twilioConnected = false
        this.login(pushChannel);
      });
      this.client.on('pushNotification', (obj) => {
        // HANDLE LOCAL PUSH NOTIFICATION
        // this.pushService.showNotification(obj.data.messageIndex, obj.body)
      });
      this.subscribeToAllChatClientEvents();
    } catch (error) {
      if (await this.loadingCtrl.getTop()) this.loadingCtrl.dismiss()
      this.presentAlert(error.message)
    }
  }

  async logout() {
    await this.removeChannelEvents()
    this.channel = null
    this.twilioConnected = false
    return this.client.shutdown()
  }

  async getChatToken(isNewToken?) {
    return await this.storage.getChatToken(isNewToken)
  }

  async getVideoToken() {
    return await this.storage.getVideoToken()
  }

  subscribeToAllChatClientEvents() {
    this.client.on('userSubscribed', user => {
      // console.log('userSubscribed', user)
    })
    this.client.on('userUpdated', () => {
      console.log('userUpdated')
    })
    this.client.on('userUnsubscribed', () => {
      console.log('userUnsubscribed')
    })
    this.client.on('channelAdded', channel => {
      // console.log('channelAdded', channel.uniqueName)
    })
    this.client.on('channelRemoved', () => {
      console.log('channelRemoved')
    })
    this.client.on('channelInvited', () => {
      console.log('channelInvited')
    })
    this.client.on('channelJoined', async channel => {
      // console.log('channelJoined', channel.uniqueName)
      const messages = await channel.getMessages(80)
      await this.saveMessagesOnStorage(messages.items, channel)
    })
    this.client.on('channelLeft', channel => {
      console.log('channelLeft', channel.uniqueName)
    })
    this.client.on('channelUpdated', updateData => {
      // console.log('channelUpdated', updateData)
      if (updateData.updateReasons.includes('lastMessage')) {
        const channel = updateData.channel.uniqueName
        const data = {
          channel
        }
        this.onChannelUpdated.emit(data)
      }
    })
    this.client.on('memberJoined', member => {
      console.log('memberJoined', member.identity)
    })
    this.client.on('memberLeft', member => {
      console.log('memberLeft', member.identity)
    })
    this.client.on('memberUpdated', member => {
      console.log('memberUpdated', member)
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
    this.client.on('typingStarted', member => {
      console.log('typingStarted', member)
    })
    this.client.on('typingEnded', member => {
      console.log('typingEnded', member)
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
    if (await this.channel.sendMessage(message, {})) {
      return 1;
    }
    return 0;
  }

  async retrieveMessages(chatId): Promise<Paginator<Message>> {
    let messages = await this.storage.getChatMessages(chatId)
    if (!await this.storage.existUnreadMessages(chatId)) {
      if (messages) return messages
    }
    if (!this.channel || this.channel.uniqueName != chatId) await this.connectToChannel(chatId)
    messages = await this.channel.getMessages(80)
    await this.saveMessagesOnStorage(messages.items)
    return messages
  }

  async saveMessagesOnStorage(messages, channel?) {
    const channelSelected = channel ? channel : this.channel
    const messagesArray = messages.map(message => {
      return {
        author: message.author,
        dateCreated: message.dateCreated,
        body: message.body,
        index: message.index,
        memberSid: message.memberSid,
        sid: message.sid,
        type: message.type
      }
    })
    const messagesToSave = {
      channel: channelSelected.uniqueName,
      messages: {
        items: messagesArray
      }
    }

    await this.storage.setChatMessages(messagesToSave)
  }

  async connectToChannel(chatId) {
    return this.client.getChannelByUniqueName(chatId)
      .then(async channel => {
        this.channel = channel
        return Promise.resolve(channel)
      }).catch(error => {
        console.log('error on getChannel', error);
        return Promise.reject(error)
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

  removeChannelEvents() {
    if (this.channel) {
      (this.channel).removeAllListeners('messageAdded');
      (this.channel).removeAllListeners('typingStarted');
      (this.channel).removeAllListeners('typingEnded');
      (this.channel).removeAllListeners('memberJoined');
      (this.channel).removeAllListeners('memberLeft');
      this.channel = null
    }
  }

  sendTyping() {
    return this.channel.typing()
  }

  addMessageToList(message) {
    console.log('new Message', message)
    return this.newMessage.emit(message)
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
    console.log(member.identity + ' start typing')
    this.isTyping.emit(true)

  }

  hideTypingStarted(member) {
    console.log(member.identity + ' end typing')
    this.isTyping.emit(false)
  }

  async getChannel(chatId): Promise<Channel> {
    // channel name = CurrentUserId_chat_receiverUserId
    const name = `${chatId}`
    let existingChannel: Channel;
    const paginator = await this.client.getSubscribedChannels()
    console.log('User Channel Paginator', paginator);
    existingChannel = paginator.items.find(channel => {
      console.log('User Channel: ' + channel.friendlyName);
      return channel.uniqueName == name
    })
    if (!existingChannel) {
      const publicPaginator = await this.client.getPublicChannelDescriptors()
      console.log('Public Channel Paginator', publicPaginator);
      var channelDescriptior = publicPaginator.items.find(channel => {
        console.log('Public Channel: ' + channel.friendlyName);
        return channel.uniqueName == name
      })
      if (channelDescriptior) existingChannel = await channelDescriptior.getChannel()
    }
    if (existingChannel) return existingChannel
    const newChannel = await this.createChannel(name, name)
    return newChannel
  }

  private async createChannel(uniqueName: string = 'general', friendlyName: string): Promise<Channel> {
    // Create a Channel
    const channel = await this.client.createChannel({
      uniqueName,
      friendlyName,
      isPrivate: false
    })
    console.log('Created general channel:');
    console.log(channel);
    return channel
  }

  async setPushRegistrationId(token) {
    console.log('setPushRegistrationId token', token);
    return this.client.setPushRegistrationId('fcm', token);
  }

  async connectToRoom(accessToken: string, options: TwilioVideo.ConnectOptions): Promise<void> {
    TwilioVideo.connect(accessToken, options).then(async room => {
      console.log(room);
      this.room = room

      console.log(`Successfully joined a Room: ${room}`);
      if (await this.loadingCtrl.getTop()) this.loadingCtrl.dismiss()
      if (!this.previewing && options['video']) {
        this.startLocalVideo();
        if (this.room.participants.size) this.onParticipantConnected.emit(this.room.participants[0])
        this.previewing = true;
      }

      room.on('disconnected', (room: TwilioVideo.Room) => {
        console.log(room.localParticipant.videoTracks);
        // Detach the local media elements
        room.localParticipant.videoTracks.forEach(publication => {
          const track = publication.track
          track.stop()
          track.disable()
          track.detach().forEach(element => element.remove())
          publication.unpublish()
        });
        room.localParticipant.audioTracks.forEach(publication => {
          const track = publication.track
          track.stop()
          track.disable()
          track.detach().forEach(element => element.remove())
          publication.unpublish()
        });
      });

      // Log your Client's LocalParticipant in the Room
      const localParticipant = room.localParticipant;
      console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);

      room.participants.forEach(participant => this.participantConnected(participant))

      // Log new Participants as they connect to the Room
      room.on('participantConnected', participant => {
        console.log(`Participant "${participant.identity}" has connected to the Room`);
        this.participantConnected(participant)
        this.onParticipantConnected.emit(participant)
      });

      // Log Participants as they disconnect from the Room
      room.on('participantDisconnected', participant => {
        console.log(`Participant "${participant.identity}" has disconnected from the Room`);
        this.participantDisconnected(participant)
      });



    }, async error => {
      console.error(`Unable to connect to Room: ${error.message}`);
      await this.presentAlert(error.message)
      if (await this.loadingCtrl.getTop()) this.loadingCtrl.dismiss()
    });
  }

  private participantConnected(participant) {
    const div = document.createElement('div')
    div.id = participant.sid;
    // div.innerText = participant.identity;
    div.style.backgroundColor = 'rgba(0,0,0,.5)'
    div.style.width = '100%'
    div.style.height = 'calc(100vh - 56px)'
    this.remoteVideo.nativeElement.appendChild(div)
    participant.on('trackSubscribed', track => this.trackSubscribed(div, track, true));
    participant.on('trackUnsubscribed', track => this.trackUnsubscribed(track));

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        this.trackSubscribed(div, publication.track, true);
      }
    });
  }

  private participantDisconnected(participant) {
    console.log('Participant "%s" disconnected', participant.identity);
    document.getElementById(participant.sid).remove();
  }

  private trackSubscribed(div: HTMLDivElement, track: TwilioVideo.RemoteAudioTrack | TwilioVideo.RemoteVideoTrack | TwilioVideo.LocalVideoTrack, resize?) {
    const videos = div.getElementsByTagName('video')
    if (videos.length && track.kind == 'video') {
      if (!this.platform.is('cordova') || resize) {
        for (let i = 0; i < videos.length; i++) {
          videos[i].style.maxWidth = '100%'
          videos[i].style.width = '100%'
          videos[i].style.height = 'auto'
        }
      }
      return
    }
    div.appendChild(track.attach());
    this.handleTrackDisabled(track)
    // console.log(videos)
  }

  private trackUnsubscribed(track) {
    track.detach().forEach(element => element.remove());
  }

  startLocalVideo(): void {
    TwilioVideo.createLocalVideoTrack().then(track => {
      this.room.localParticipant.publishTrack(track)
      console.log('LocalParticipant VideoTrack', track);
      this.localVideo.nativeElement.appendChild(track.attach());
      this.trackSubscribed(this.localVideo.nativeElement, track, true)
    });
  }

  toggleCamera(active) {
    this.room.localParticipant.videoTracks.forEach(publication => {
      if (!active) publication.track.disable();
      else publication.track.enable()
    })
  }

  toggleAudio(active) {
    this.room.localParticipant.audioTracks.forEach(publication => {
      if (!active) publication.track.disable();
      else publication.track.enable()
    })
  }

  handleTrackDisabled(track) {
    track.on('disabled', track_dsabled => {
      /* Hide the associated <video> element and show an avatar image. */
      console.log('Track Disabled', track);
      console.log('track_dsabled', track_dsabled);

    });
    track.on('enabled', track_enabled => {
      /* Hide the avatar image and show the associated <video> element. */
      console.log('Track Enabled', track);
      console.log('track_enabled', track_enabled);

    });
  }


  async acceptCall(): Promise<void> {
    this.onCallAccepted.emit(true)
  }

  async dismissIncomingCallModal(): Promise<any> {
    if (this.incomingCallModal) {
      this.incomingCallModal.dismiss({})
    }
    this.incomingCallModal = null
  }

  async presentIncomingCallScreen(name: string, id: number): Promise<HTMLIonModalElement> {
    if (this.incomingCallModal) return
    console.log('PRESENT INCOMING CALL');

    const caller = {
      name,
      id
    }
    this.incomingCallModal = await this.modalCtrl.create({
      component: IncomingCallComponent,
      componentProps: {
        caller
      },
      keyboardClose: false,
    });
    await this.incomingCallModal.present()
    const { data } = await this.incomingCallModal.onDidDismiss();
    if (data.answered) {
      this.acceptCall()
    } else {
      this.incomingCallModal = null
    }
    return this.incomingCallModal
  }

  async dismissOutcomingCallModal(): Promise<any> {
    if (this.outcomingCallModal) {
      this.outcomingCallModal.dismiss({})
    }
    this.outcomingCallModal = null
  }

  async presentOutcomingCallScreen(name: string, id: number): Promise<void> {
    const receiver = {
      name,
      id
    }
    this.outcomingCallModal = await this.modalCtrl.create({
      component: OutcomingCallComponent,
      componentProps: {
        receiver
      },
      keyboardClose: false,
    });
    await this.outcomingCallModal.present()
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

  async presentAlert(message) {
    const alert = await this.alertCtrl.create({
      message,
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
