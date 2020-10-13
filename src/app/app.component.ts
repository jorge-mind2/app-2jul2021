import { Component } from '@angular/core';

import { Platform, NavController, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './api-services/auth.service';
import { StorageService } from './api-services/storage.service';
import { PushNotificationsService } from './api-services/push-notifications.service';
import { TwilioService } from './api-services/twilio.service';
import { Router } from '@angular/router';
import { VideoCallComponent } from './common/video-call/video-call.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  private rootPage: string = 'welcome';
  loddgerUser: any
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private auth: AuthService,
    private router: Router,
    private storageService: StorageService,
    private notifications: PushNotificationsService,
    private twilioService: TwilioService
  ) {
    this.initializeApp();

  }

  initializeApp() {
    this.platform.ready().then(async () => {
      console.log('Platform ready');
      this.statusBar.backgroundColorByHexString('#006675')
      await this.auth.checkToken()
      this.splashScreen.hide();
      if (this.platform.is('cordova')) this.notifications.initFirebase()
      this.subscribeToGeneralEvents()
    });

  }

  subscribeToGeneralEvents() {

    this.auth.authenticationState.subscribe(async state => {
      console.log('state', state);
      const userType = await this.storageService.getUserType();
      console.log('userType', userType);

      if (userType && state) {
        console.log('this.twilioService.twilioConnected', this.twilioService.twilioConnected);

        if (!this.twilioService.twilioConnected) await this.twilioService.login()
        return true;
      }
      else if (state === false) {
        this.navCtrl.navigateRoot(this.rootPage)
      }

    })

    this.notifications.onMessageReceived.subscribe(notification => {
      //TODO
      /**
       * Mostrar notificación solo si está fuera de la página de chat o videollamada
       * Manejar tap de la notificación de chat
       * Manejar eventos de notificación de llamada
       */
      console.log('notification', notification);
      /*
      notification = {
          body: "María: Qué onda juan"
          data: {
            senderId: 13,
            type: "message"
          }
          from: "378566212104"
          id: "14"
          messageType: "data"
          sent_time: "1602352156070"
          show_notification: "false"
          ttl: "2419200"
          twi_body: "María: Qué onda juan"
          twi_message_id: "RU302519c83173eccd9dc534bd794aa690"
          twi_message_type: "data"
        }
      */

      // recive notificación si está corriendo en foreground la app
      const notificationData = notification.data || null

      const currentRoute = this.router.url
      if (notificationData.type == 'call') {
        this.twilioService.presentIncomingCallScreen(notificationData.caller)
      }
      if (currentRoute.includes('/chat')) {
        notification.show_notification = false
      }
      if (notification.show_notification) this.notifications.showLocalNotification(notification.id, notification.body, notification.title, notificationData)

    })

    this.notifications.onCallAnswered.subscribe(answered => {
      this.twilioService.dismissIncomingCallModal()
      if (answered) {
        this.openCallComponent()
      }
    })

    this.twilioService.onCallAccepted.subscribe(answered => {
      this.twilioService.dismissIncomingCallModal()
      if (answered) {
        this.openCallComponent()
      }
    })
  }

  async openCallComponent() {
    const modal = await this.modalCtrl.create({
      component: VideoCallComponent,
      componentProps: {
      }
    });
    return await modal.present()
  }

}
