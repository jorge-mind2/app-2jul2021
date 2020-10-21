import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { ILocalNotification } from '@ionic-native/local-notifications/ngx';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient } from '@angular/common/http';
import { TwilioService } from './twilio.service';
const CURRENT_USER = 'currentUser'

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  service: Storage;
  onSetUnreadMessages: EventEmitter<any> = new EventEmitter()
  constructor(
    private storage: Storage,
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) { this.service = storage }

  /* async setUnreadMessages(message: CometChat.TextMessage, setUnread: boolean): Promise<void> {
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
  } */

  async setNotificationsSchedule(notification: ILocalNotification): Promise<any> {
    const notificationSchedule = await this.storage.get('notification_schedule')
    console.log('notification to Schedule', notification);

    return await this.storage.set('notification_schedule', [notification].concat(notificationSchedule || []))
  }

  async getNotificationsSchedule(): Promise<ILocalNotification[]> {
    const notificationSchedule = await this.storage.get('notification_schedule')
    return [].concat(notificationSchedule || [])
  }

  public async setUserType(userType) {
    return await this.storage.set('userType', userType);
  }

  public async getUserType() {
    return await this.storage.get('userType');
  }

  public async setCurrentUser(user) {
    if (user.role) await this.setUserType(user.role.name)
    return await this.storage.set(CURRENT_USER, user);
  }

  public async getCurrentUser() {
    return await this.storage.get(CURRENT_USER);
  }

  async updateCurrentUser(newUser: any): Promise<any> {
    let currentUser = await this.getCurrentUser()
    // console.log('currentUser', currentUser);
    // console.log('newUser', newUser);

    Array.from(Object.keys(newUser)).forEach((val, indx) => {
      // console.log(val);
      // console.log(indx);
      currentUser[val] = newUser[val]
    })

    return await this.setCurrentUser(currentUser)
  }

  async setVideoToken(token, room) {
    return await this.storage.set(`${room}_video_token`, token)
  }

  async setChatToken(token) {
    return await this.storage.set('chat_token', token)
  }

  async getVideoToken(room) {
    const currentToken = await this.storage.get(`${room}_video_token`)
    if (currentToken && !this.jwtHelper.isTokenExpired(currentToken)) {
      console.log('token valido');
      return currentToken
    } else {
      console.log('token invalido');
      const response: any = await this.http.get(`/users/video-token?room=${room}`).toPromise()
      console.log(response);
      // this.accessToken = response.data.token
      this.setVideoToken(response.data.token, room)
      return response.data.token
    }
    return
  }

  async getChatToken() {
    const currentToken = await this.storage.get('chat_token')
    if (currentToken && !this.jwtHelper.isTokenExpired(currentToken)) {
      console.log('token valido');
      return currentToken
    } else {
      console.log('token invalido');
      const response: any = await this.http.get('/users/chat-token').toPromise()
      console.log(response);
      // this.accessToken = response.data.token
      this.setChatToken(response.data.token)
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

  async getChatMessages(channel) {
    const messagesData: [] = await this.storage.get('chat_messages')
    /*
      messagesData = [
        {
          channel: string,
          messages: messages[]
        }
      ]
    */
    if (messagesData && messagesData.length) {
      const searchedMessages: any = messagesData.find((data: any) => data.channel == channel)
      if (searchedMessages) return searchedMessages.messages
    }
    return null;
  }

  async setChatMessages(messagesToSave: { channel: string, messages: { items: any[] } }): Promise<any> {
    /*
      messagesToSave = {
          channel: string,
          messages: messages[]
        }
    */
    let messagesData: any[] = await this.storage.get('chat_messages')
    console.log('messagesData', messagesData);

    if (!messagesData) messagesData = []
    const existingChannel = messagesData.findIndex((data: any) => messagesToSave.channel == data.channel)
    console.log('existingChannel', existingChannel);

    if (existingChannel > -1) {
      messagesData[existingChannel] = messagesToSave
    } else {
      messagesData.push(messagesToSave)
    }
    return await this.storage.set('chat_messages', messagesData)
  }


  async deleteChatStorage() {
    return this.storage.remove('chat_token').then(async () => {
      await this.storage.forEach((val, key) => {
        if (key.includes('_video_token')) this.storage.remove(key)
      })
      await this.storage.remove('currentChatId')
      await this.storage.remove('currentReceiver')
      await this.storage.remove('unread_messages')
      await this.storage.remove('receiverId')
      return await this.storage.remove('chat_messages')

    })
  }

  async deleteUserStorage() {
    await this.storage.remove(CURRENT_USER)
    await this.storage.remove('userType')
    await this.deleteChatStorage()
  }
}
