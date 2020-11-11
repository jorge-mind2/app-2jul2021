import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { LocalNotifications, ILocalNotification } from '@ionic-native/local-notifications/ngx';
import { Platform } from '@ionic/angular';
import { Client } from 'twilio-chat';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService implements OnInit {
  onMessageReceived: EventEmitter<string> = new EventEmitter()
  onCallAnswered: EventEmitter<boolean> = new EventEmitter()
  onMissedCall: EventEmitter<any> = new EventEmitter()
  onRejectedCall: EventEmitter<any> = new EventEmitter()
  onAcceptedCall: EventEmitter<any> = new EventEmitter()
  onAssignedTherapist: EventEmitter<any> = new EventEmitter()
  registeredPushChannel: Client.NotificationsChannelType = null
  constructor(
    private fcm: FirebaseX,
    private localNotifications: LocalNotifications,
    private platform: Platform,
    private api: ApiService
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
    return this.fcm.onMessageReceived().subscribe(async notification => {
      console.log("here you receive the message", notification);
      var rawData = this.getRawPushForFCM({ ...notification });
      console.log('notification show_notification', notification.show_notification);

      if (notification.show_notification == 'true') {
        // se muestra cuando la app está cerrada (FireBasePlugin la gestiona)
        console.log("Received in background");
        rawData.data.show_local_notification = false
      } else {
        // se muestra cuando la app está abierta o en segundo plano
        console.log("Received in foreground");
        rawData.data.show_local_notification = true
      }
      if (rawData.data.data) {
        if (typeof rawData.data.data == 'string') rawData.data.data = JSON.parse(rawData.data.data)
      }
      console.log('Twilio onPushNotification', rawData);
      this.onMessageReceived.emit(rawData.data)
    });
  };

  private subscribeToNotificationEvents() {
    this.localNotifications.on('trigger').subscribe(async notification => {
      console.log('local notification trigger', notification);
      const type = notification.data.type
      console.log('notification type', type);
      if (type && type == 'call-accepted') {
        await this.clearNotifications()
        return this.onAcceptedCall.emit(notification)
      }
      if (type && type == 'call-rejected') {
        // el paciente rechazó la llamada
        return this.onRejectedCall.emit(notification)
      }
      if (type && type == 'call-missed') {
        // el terapeuta colgó al marcar
        return this.onMissedCall.emit(notification)
      }
      if (type && type == 'therapist-assigned') {
        // al paciente se le asignó terapeuta
        return this.onAssignedTherapist.emit(notification)
      }
    })
    this.localNotifications.on('open-chat').subscribe(notification => {
      console.log('local notification open-chat', notification);
    })
    this.localNotifications.on('answer-call').subscribe(async notification => {
      console.log('local notification answer-call', notification);
      await this.api.sendAcceptCall(notification.data.callerId)
      await this.clearNotifications()
      return this.onCallAnswered.emit(true)
    })
    this.localNotifications.on('reject-call').subscribe(notification => {
      console.log('local notification reject-call', notification);
      return this.onCallAnswered.emit(false)
    })
    this.localNotifications.on('click').subscribe(notification => {
      this.clearNotifications()
      console.log('local notification tap', notification);
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

  clearNotifications() {
    return this.localNotifications.clearAll()
  }

}
