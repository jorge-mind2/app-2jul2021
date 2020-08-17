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
          /*
          jsonMsg = {
            "receiver": "t-4a8447",
            "data": {
              "entities": {
                "receiver": {
                  "entityType": "user",
                  "entity": {
                    "lastActiveAt": 1597518855,
                    "uid": "t-4a8447",
                    "role": "therapist",
                    "name": "Juan Pinzon",
                    "status": "available"
                  }
                },
                "sender": {
                  "entityType": "user",
                  "entity": {
                    "lastActiveAt": 1597518855,
                    "uid": "p-dfb08e",
                    "role": "patient",
                    "name": "María Chavez",
                    "status": "available"
                  }
                }
              },
              "text": "Hola"
            },
            "sender": "p-dfb08e",
            "conversationId": "p-dfb08e_user_t-4a8447",
            "receiverType": "user",
            "id": "461",
            "sentAt": 1597518880,
            "category": "message",
            "type": "text",
            "updatedAt": 1597518880
          }
           */
          var processedMessage: CometChat.BaseMessage = await CometChat.CometChatHelper.processMessage(jsonMsg);
          console.log('JSON MESSAGE', jsonMsg);
          console.log('CometChat.CometChatHelper.processMessage()', processedMessage);
          console.log('this.route.url', this.route.url);
          if (!this.route.url.includes('support') && !this.route.url.includes('chat')) {
            processedMessage.setType('text')
            this.showNotification(+jsonMsg.id, jsonMsg.data.text, jsonMsg.data.entities.sender.entity.name, false)
            this.onNotification.emit(processedMessage)
          }
        }
      };
    });
  };

  public async getFCMToken() {
    return await this.fcm.getToken();
  }

  showNotification(id: number = new Date().getTime(), text: string, title: string = 'Mind2', saveToSchedule: boolean = false): void {
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

  }



}
