import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';
import { Router } from '@angular/router';
import { LocalNotifications, ILocalNotification, ILocalNotificationActionType } from '@ionic-native/local-notifications/ngx';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService implements OnInit {
  onNotification: EventEmitter<any> = new EventEmitter()
  constructor(
    private fcm: FirebaseX,
    private route: Router,
    private localNotifications: LocalNotifications,
    private storageService: StorageService
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
      if (data.wasTapped) {
        console.log("Received in background");
      } else {
        console.log("Received in foreground");
        if (data.message) { // CometChat Message received in foreground
          var jsonMsg = JSON.parse(data.message);
          var processedMessage = await CometChat.CometChatHelper.processMessage(jsonMsg);
          console.log('JSON MESSAGE', jsonMsg);
          console.log('CometChat.CometChatHelper.processMessage()', processedMessage);
          console.log('this.route.url', this.route.url);
          if (!this.route.url.includes('support') && !this.route.url.includes('chat')) {
            this.showNotification(jsonMsg.data.text, jsonMsg.data.entities.sender.entity.name, false)
            this.onNotification.emit(processedMessage)
          }
        }
      };
    });
  };

  public async getFCMToken() {
    return await this.fcm.getToken();
  }

  showNotification(text: string, title: string = 'Mind2', saveToSchedule: boolean = false): void {
    this.storageService.getNotificationsSchedule().then(schedule => {
      const notif: ILocalNotification = {
        id: 1,
        text,
        title,
        vibrate: true,
        led: true,
        priority: -1,
        silent: false,
        wakeup: true,
        sound: 'file://sound.mp3',
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

    })
  }



}
