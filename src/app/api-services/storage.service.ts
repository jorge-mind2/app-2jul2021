import { Injectable, EventEmitter } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';

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
    await this.storage.set('unread_messages', scheduledMessages)
    return this.onSetUnreadMessages.emit(true)
  }

  async getUnreadMessages(): Promise<any[]> {
    const scheduledMessages = await this.storage.get('unread_messages')
    return [].concat(scheduledMessages || [])
  }

  async setNotificationsSchedule(notification): Promise<any> {
    const notificationSchedule = await this.storage.get('notification_schedule') || []
    console.log('notificationSchedule', notificationSchedule);

    return await this.storage.set('notification_schedule', notificationSchedule.push(notification))
  }

  async getNotificationsSchedule(): Promise<any[]> {
    const notificationSchedule = await this.storage.get('notification_schedule')
    return [].concat(notificationSchedule || [])
  }
}
