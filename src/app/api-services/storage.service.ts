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

  async updateCurrentUser(newUserProperties: any): Promise<any> {
    let currentUser = await this.getCurrentUser()
    // console.log('currentUser', currentUser);
    // console.log('newUserProperties', newUserProperties);

    Array.from(Object.keys(newUserProperties)).forEach((val, indx) => {
      // console.log(val);
      // console.log(indx);
      currentUser[val] = newUserProperties[val]
    })

    return await this.setCurrentUser(currentUser)
  }

  async setUnreadMessages(channel: string, unreadMessages: boolean) {
    this.onSetUnreadMessages.emit({ channel, status: unreadMessages })
    return this.storage.set(channel, unreadMessages)
  }

  async existUnreadMessages(channel: string) {
    const val = await this.storage.get(channel)
    return Boolean(val)
  }

  async setVideoToken(token, room) {
    return await this.storage.set(`${room}_videoToken`, token)
  }

  async setChatToken(token) {
    return await this.storage.set('chatToken', token)
  }

  async getVideoToken() {
    const room = await this.getCurrentRoom()
    const currentToken = await this.storage.get(`${room}_videoToken`)
    if (currentToken && !this.jwtHelper.isTokenExpired(currentToken)) {
      console.log('token valido');
      return currentToken
    } else {
      console.log('token invalido');
      const response: any = await this.http.get(`/users/video-token`).toPromise()
      console.log(response);
      // this.accessToken = response.data.token
      await this.setCurrentRoom(response.data.room)
      await this.setVideoToken(response.data.token, response.data.room)
      return response.data.token
    }
  }

  async getChatToken(newToken?) {
    const currentToken = await this.storage.get('chatToken')
    if (currentToken && !this.jwtHelper.isTokenExpired(currentToken) && !newToken) {
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

  async setCurrentRoom(room: string) {
    return await this.storage.set('currentRoom', room)
  }

  async getCurrentRoom() {
    return await this.storage.get('currentRoom')
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
    const messagesData: [] = await this.storage.get('chatMessages')
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
    let messagesData: any[] = await this.storage.get('chatMessages')
    console.log('messagesData', messagesData);

    if (!messagesData) messagesData = []
    const existingChannel = messagesData.findIndex((data: any) => messagesToSave.channel == data.channel)
    console.log('existingChannel', existingChannel);

    if (existingChannel > -1) {
      messagesData[existingChannel] = messagesToSave
    } else {
      messagesData.push(messagesToSave)
    }
    return await this.storage.set('chatMessages', messagesData)
  }


  async deleteChatStorage() {
    return this.storage.remove('chatToken').then(async () => {
      await this.storage.forEach((val, key) => {
        if (key.includes('_video_token')) this.storage.remove(key)
        if (key.includes('_channel_')) this.storage.remove(key)
      })
      await this.storage.remove('currentChatId')
      await this.storage.remove('currentReceiver')
      await this.storage.remove('unread_messages')
      await this.storage.remove('receiverId')
      return await this.storage.remove('chatMessages')

    })
  }

  async deleteUserStorage() {
    await this.storage.remove(CURRENT_USER)
    await this.storage.remove('userType')
    await this.deleteChatStorage()
  }
}
