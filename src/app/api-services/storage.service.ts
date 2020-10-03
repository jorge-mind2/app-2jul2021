import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ILocalNotification } from '@ionic-native/local-notifications/ngx';
import { AuthService } from './auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  onSetUnreadMessages: EventEmitter<any> = new EventEmitter()
  constructor(
    private storage: Storage,
    private auth: AuthService,
    private api: ApiService,
    private jwtHelper: JwtHelperService
  ) { }

  async setUnreadMessages(message: CometChat.TextMessage, setUnread: boolean): Promise<void> {
    const scheduledMessages = await this.storage.get('unread_messages') || []

    const scheduledMessage = scheduledMessages.find(smessage => smessage.id == message.getSender().getUid())

    if (scheduledMessage) {
      scheduledMessage.unread = setUnread
    } else {
      scheduledMessages.push({
        type: message.getSender().getRole(),
        id: message.getSender().getUid(),
        unread: setUnread
      })
    }
    console.log('scheduledMessages', scheduledMessages);

    await this.storage.set('unread_messages', scheduledMessages)
    return this.onSetUnreadMessages.emit(true)
  }

  async getUnreadMessages(user_id?: string, message_id?: string): Promise<any[]> {
    const scheduledMessages = await this.storage.get('unread_messages')
    if (user_id) return scheduledMessages.find(scheduled => scheduled.id == user_id)
    return [].concat(scheduledMessages || [])
  }

  async setNotificationsSchedule(notification: ILocalNotification): Promise<any> {
    const notificationSchedule = await this.storage.get('notification_schedule')
    console.log('notification to Schedule', notification);

    return await this.storage.set('notification_schedule', [notification].concat(notificationSchedule || []))
  }

  async getNotificationsSchedule(): Promise<ILocalNotification[]> {
    const notificationSchedule = await this.storage.get('notification_schedule')
    return [].concat(notificationSchedule || [])
  }

  async updateCurrentUser(newUser: any): Promise<any> {
    let currentUser = await this.auth.getCurrentUser()
    // console.log('currentUser', currentUser);
    // console.log('newUser', newUser);

    Array.from(Object.keys(newUser)).forEach((val, indx) => {
      // console.log(val);
      // console.log(indx);
      currentUser[val] = newUser[val]
    })

    return await this.auth.setCurrentUser(currentUser)
  }

  async setChatVideoToken(data) {
    return await this.storage.set('chat_video_token', data)
  }

  async getChatVideoToken() {
    const currentToken = await this.storage.get('chat_video_token')
    if (currentToken && !this.jwtHelper.isTokenExpired(currentToken)) {
      console.log('token valido');
      return currentToken
    } else {
      console.log('token invalido');
      const response = await this.api.getTwilioToken()
      console.log(response);
      // this.accessToken = response.data.token
      this.setChatVideoToken(response.data.token)
      return response.data.token
    }
    return
  }

  async setCurrentchatId(currentChatId) {
    return await this.storage.set('currentChatId', currentChatId)
  }

  async getCurrentChatId() {
    return await this.storage.get('currentChatId')
  }

  async setCurrentReceiver(receiver) {
    return await this.storage.set('currentReceiver', receiver)
  }

  async getCurrentReceiver() {
    return await this.storage.get('currentReceiver')
  }

  async setChatMessages(messages) {
    return await this.storage.set('chatMessages', messages)
  }

  async getChatMessages() {
    return await this.storage.get('chatMessages')
  }
}
