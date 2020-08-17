import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { ILocalNotification } from '@ionic-native/local-notifications/ngx';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  onSetUnreadMessages: EventEmitter<any> = new EventEmitter()
  constructor(
    private storage: Storage
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
}
