import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { LocalNotifications, ILocalNotification } from '@ionic-native/local-notifications/ngx';
import { Platform } from '@ionic/angular';
import { Client } from 'twilio-chat';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService implements OnInit {
  onMessageReceived: EventEmitter<string> = new EventEmitter()
  onCallAnswered: EventEmitter<boolean> = new EventEmitter()
  registeredPushChannel: Client.NotificationsChannelType = null
  constructor(
    private fcm: FirebaseX,
    private localNotifications: LocalNotifications,
    private platform: Platform,
  ) { }

  ngOnInit() {
  }

  public async initFirebase(): Promise<any> {
    console.log('init FCM service');
    // return await this.fcm.getToken();
    const perms = await this.fcm.hasPermission().then(granted => {
      if (!granted) {
        this.fcm.grantPermission()
      }
    })
    console.log(perms);
    this.subscribeToNotificationEvents()
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
      if (data.show_notification == 'true') {
        // this.showNotification(data.id, data.twi_body)
        console.log("Received in background");
        rawData.show_local_notification = false
      } else {
        console.log("Received in foreground from fcm onMessageReceived");
        rawData.show_local_notification = true
      }
      if (rawData.data.data) {
        if (typeof rawData.data.data == 'string') rawData.data.data = JSON.parse(rawData.data.data)
      }
      console.log('Twilio onPushNotification', rawData);
      this.onMessageReceived.emit(rawData.data)
    });
  };

  private subscribeToNotificationEvents() {
    this.localNotifications.on('trigger').subscribe(data => {
      console.log('local notification trigger', data);

    })
    this.localNotifications.on('open-chat').subscribe(data => {
      console.log('local notification open-chat', data);

    })
    this.localNotifications.on('answer-call').subscribe(data => {
      console.log('local notification answer-call', data);
      this.onCallAnswered.emit(true)

    })
    this.localNotifications.on('reject-call').subscribe(data => {
      console.log('local notification reject-call', data);
      this.onCallAnswered.emit(false)
    })
    this.localNotifications.on('click').subscribe(data => {
      console.log('local notification tap', data);

    })
  }

  private getRawPushForFCM(data): any {
    if (!data.twi_message_type) data.twi_message_type = 'data'
    var rawData = { ...data, data };
    return rawData;
  }

  public async getFCMToken() {
    if (!this.platform.is('cordova')) return null
    return await this.fcm.getToken();
  }

  showLocalNotification(id: number = new Date().getTime(), text: string, title: string = 'Mind2', data?: any): void {
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
      channel: 'fcm_default_channel',
      data
    }
    if (data.type) {
      if (data.type == 'call') {
        notif.actions = [
          { id: 'answer-call', title: 'Contestar' },
          { id: 'reject-call', title: 'Rechazar' }
        ]
      } else if (data.type == 'message') {
        notif.actions = [
          { id: 'open-chat', title: 'Abrir conversación' }
        ]
      }
    }
    this.localNotifications.schedule(notif)
  }

}
