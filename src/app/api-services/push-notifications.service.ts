import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { Router } from '@angular/router';
import { LocalNotifications, ILocalNotification, ILocalNotificationActionType } from '@ionic-native/local-notifications/ngx';
import { StorageService } from './storage.service';
import { Push, PushObject } from '@ionic-native/push/ngx';
import { Platform } from '@ionic/angular';
import { Client } from 'twilio-chat';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService implements OnInit {
  onNotification: EventEmitter<any> = new EventEmitter()
  registeredPushChannel: Client.NotificationsChannelType = null
  constructor(
    private fcm: FirebaseX,
    private route: Router,
    private localNotifications: LocalNotifications,
    private storageService: StorageService,
    private platform: Platform,
    private push: Push,
  ) { }

  ngOnInit() {
  }

  public async initFirebase(): Promise<any> {
    console.log('init FCM service');
    // return await this.fcm.getToken();
    const perms = await this.fcm.hasPermission()
    console.log(perms);
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
      if (data.wasTapped) {
        console.log("Received in background");
      } else {
        console.log("Received in foreground");

      };
    });
  };

  public async getFCMToken() {
    if (!this.platform.is('cordova')) return null
    return await this.fcm.getToken();
  }

  /* showNotification(id: number = new Date().getTime(), text: string, title: string = 'Mind2', saveToSchedule: boolean = false): void {
    this.localNotifications.getAll().then(schedule => {
      console.log('notificationSchedule', schedule);
    })

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
      actions: [{
        id: 'reply',
        type: ILocalNotificationActionType.INPUT,
        title: 'Responder',
        foreground: true,
      },]
    }
    this.localNotifications.schedule(notif);
    if (saveToSchedule) this.storageService.setNotificationsSchedule(notif)

  } */


  registerForPushCallback(handlePushNotification, cb): void {
    console.log('app.registerForPushCallback::calling push init');

    const pushObject: PushObject = this.push.init({
      android: {
        senderID: '378566212104',
        sound: true,
        vibrate: true,
        forceShow: true,
      },
      ios: {
        sound: true,
        badge: true
      }
    })

    pushObject.on('notification').subscribe((notification: any) => {
      console.log('Received a notification', notification)
      var result = null;
      var rawData = null;
      if (this.registeredPushChannel !== null) {
        if (this.registeredPushChannel === 'fcm') {
          rawData = this.getRawPushForFCM(notification);
        }
        console.log(
          'this.notification::re-parsed raw push',
          JSON.stringify(rawData)
        );
        result = handlePushNotification(rawData);
      }
      if (result !== null) {
        this.showPushCallback(result);
      }
    });

    pushObject.on('registration').subscribe((registration: any) => {
      console.log('Device registered', registration)
      var oldRegId = localStorage.getItem('registrationId');
      if (oldRegId !== registration.registrationId) {
        // Save new registration ID
        localStorage.setItem('registrationId', registration.registrationId);
        // Post registrationId to your app server as the value has changed
      }
      console.log(
        'app.registerForPushCallback::setting push registration id',
        registration.registrationId
      );
      cb(registration.registrationId);
    });

    pushObject.on('error').subscribe(error => {
      console.error('Error with Push plugin', error)
    });


  }

  getRawPushForFCM(data) {
    var rawData = {
      data: data.additionalData
    };
    if (data.message) {
      rawData.data.twi_body = data.message;
    }
    if (data.title) {
      rawData.data.twi_title = data.title;
    }
    if (data.sound) {
      rawData.data.twi_sound = data.sound;
    }
    return rawData;
  }

  showPushCallback(push) {
    console.log('app.showPushCallback::parsed push', push);
    alert(push.body);
  }


}
