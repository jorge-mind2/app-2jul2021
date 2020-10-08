import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { LocalNotifications, ILocalNotification, ILocalNotificationActionType } from '@ionic-native/local-notifications/ngx';
import { StorageService } from './storage.service';
import { Platform } from '@ionic/angular';
import { Client } from 'twilio-chat';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService implements OnInit {
  onNotification: EventEmitter<any> = new EventEmitter()
  onMessageRecieved: EventEmitter<string> = new EventEmitter()
  registeredPushChannel: Client.NotificationsChannelType = null
  constructor(
    private fcm: FirebaseX,
    private localNotifications: LocalNotifications,
    private storageService: StorageService,
    private platform: Platform,
  ) { }

  ngOnInit() {
  }

  public async initFirebase(): Promise<any> {
    console.log('init FCM service');
    // return await this.fcm.getToken();
    const perms = await this.fcm.hasPermission()
    console.log(perms);
    this.localNotifications.on('click').subscribe(data => {
      console.log('notification click', data);

    })
    return this.fcm.onMessageReceived().subscribe(async data => {
      console.log("here you receive the message", data);
      /*
        data = {
          "channel_id": "CH296f4a24749d4347a2bf7b4a4754ecb4",
          "message_id": "IM31b349972c644c3184b11ee4dba44169",
          "author": "juan.pinzon@mail.com",
          "message_index": "49",
          "messageType": "data",
          "message_sid": "IM31b349972c644c3184b11ee4dba44169",
          "twi_message_type": "twilio.channel.new_message",
          "id": "2",
          "ttl": "86400",
          "from": "378566212104",
          "channel_sid": "CH296f4a24749d4347a2bf7b4a4754ecb4",
          "sent_time": "1602006755024",
          "twi_message_id": "RU4e75224af4dc01b8ae1bc150f74bc6c3",
          "twi_body": "13_chat_therapist_16;juan.pinzon@mail.com: Quiubo ",
          "channel_title": "13_chat_therapist_16",
          "show_notification": "false"
        }
      */
      var rawData = null;
      rawData = this.getRawPushForFCM(data);
      console.log('Notification rawData', rawData);
      this.onMessageRecieved.emit(rawData)
      if (data.show_notification == 'true') {
        console.log('// SI LLEGA CON LA APP APAGADA')
        // this.showNotification(data.id, data.twi_body)
        console.log("Received in background");
      } else {
        console.log("Received in foreground from fcm onMessageRecieved");
      };
    });
  };

  private getRawPushForFCM(data): any {
    /* if (typeof notificationPayload.data !== 'undefined') {
      var dataPayload = notificationPayload.data;
      if (!dataPayload.twi_message_type) {
        throw new Error('Provided push notification payload does not contain Programmable Chat push notification type');
      }
      var _data = Client.parsePushNotificationChatData(notificationPayload.data);
      return new pushnotification_1.PushNotification({
        title: dataPayload.twi_title || null,
        body: dataPayload.twi_body || null,
        sound: dataPayload.twi_sound || null,
        badge: null,
        action: dataPayload.twi_action || null,
        type: dataPayload.twi_message_type,
        data: _data
      });
    } */
    if (!data.twi_message_type) data.twi_message_type = 'data'
    var rawData = { ...data, data };
    /*
      data = {
        "channel_id": "CH296f4a24749d4347a2bf7b4a4754ecb4",
        "message_id": "IM31b349972c644c3184b11ee4dba44169",
        "author": "juan.pinzon@mail.com",
        "message_index": "49",
        "messageType": "data",
        "message_sid": "IM31b349972c644c3184b11ee4dba44169",
        "twi_message_type": "twilio.channel.new_message",
        "id": "2",
        "ttl": "86400",
        "from": "378566212104",
        "channel_sid": "CH296f4a24749d4347a2bf7b4a4754ecb4",
        "sent_time": "1602006755024",
        "twi_message_id": "RU4e75224af4dc01b8ae1bc150f74bc6c3",
        "twi_body": "13_chat_therapist_16;juan.pinzon@mail.com: Quiubo ",
        "channel_title": "13_chat_therapist_16",
        "show_notification": "false"
      }
    */
    return rawData;
  }

  public async getFCMToken() {
    if (!this.platform.is('cordova')) return null
    return await this.fcm.getToken();
  }

  showNotification(id: number = new Date().getTime(), text: string, title: string = 'Mind2', saveToSchedule: boolean = false): void {
    /* this.localNotifications.getAll().then(schedule => {
      console.log('notificationSchedule', schedule);
    }) */
    var now = new Date().getTime()

    const notif: ILocalNotification = {
      id,
      title,
      text,
      vibrate: true,
      led: true,
      priority: 2,
      silent: false,
      wakeup: true,
      foreground: true,
      launch: true,
      trigger: {
        at: new Date(now + 3000)
      }
    }
    this.localNotifications.schedule(notif);
    if (saveToSchedule) this.storageService.setNotificationsSchedule(notif)

  }

}
