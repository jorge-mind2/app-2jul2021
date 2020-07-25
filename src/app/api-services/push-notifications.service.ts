import { Injectable, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
// import { LocalNotifications, ILocalNotification, ILocalNotificationActionType } from '@ionic-native/local-notifications/ngx';

declare var CCCometChat: any;

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService implements OnInit {
  constructor(
    private platform: Platform,
    private fcm: FirebaseX,
    // private localNotifications: LocalNotifications
  ) {
    this.platform.ready().then(() => {
      this.initFirebase()
    })
  }

  ngOnInit() {
  }

  public async initFirebase(): Promise<any> {
    const firebaseConfig = {
      apiKey: "AIzaSyCsO2yH7g25fwTwuyGRI2exQytJgifUj6s",
      authDomain: "mind2dev-5ddb1.firebaseapp.com",
      databaseURL: "https://mind2dev-5ddb1.firebaseio.com",
      projectId: "mind2dev-5ddb1",
      storageBucket: "mind2dev-5ddb1.appspot.com",
      messagingSenderId: "378566212104",
      appId: "1:378566212104:web:2179e18bf770db09d7efbd",
      measurementId: 'G-measurement-id'
    };

    console.log('init FCM service');


    // return await this.fcm.getToken();
    const perms = await this.fcm.hasPermission()
    console.log(perms);


    return this.fcm.onMessageReceived().subscribe(data => {
      console.log("here you receive the message", data);
      if (data.message) {
        var jsonMsg = JSON.parse(data.message);
        var processedMessage = CometChat.CometChatHelper.processMessage(jsonMsg);
        console.log('JSON MESSAGE', jsonMsg);
        console.log('CometChat.CometChatHelper.processMessage()', processedMessage);
      }
      alert('FCM onMessageReceived show Push Notification here')
      if (data.wasTapped) {
        console.log("Received in background");
      } else {
        console.log("Received in foreground");
      };
    });
  };

  public async getFCMToken() {
    return await this.fcm.getToken();
  }

  /* showNotification(text: string, title: string = 'Mind2'): void {
    const notif: ILocalNotification = {
      id: 1,
      text,
      title,
      vibrate: true,
      led: true,
      priority: 2,
      silent: false,
      wakeup: true,
      foreground: true,
      actions: [{
        id: 'reply',
        type: ILocalNotificationActionType.INPUT,
        title: 'Reply',
        foreground: true,
      },]
    }
    this.localNotifications.schedule(notif);
  } */

}
