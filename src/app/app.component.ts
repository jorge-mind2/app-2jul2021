import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './api-services/auth.service';
import { CometChatService } from './api-services/comet-chat.service';
import { StorageService } from './api-services/storage.service';
import { PushNotificationsService } from './api-services/push-notifications.service';
import { TwilioService } from './api-services/twilio.service';

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
    private auth: AuthService,
    private cometchat: CometChatService,
    private storageService: StorageService,
    private notifications: PushNotificationsService,
    private twilioService: TwilioService
  ) {
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

    this.twilioService.onMessageReceived.subscribe(notification => {
      //TODO
      /**
       * Mostrar notificación solo si está fuera de la página de chat o videollamada
       * Manejar tap de la notificación de chat
       * Manejar eventos de notificación de llamada
       */
    })
    this.initializeApp();

  }

  initializeApp() {
    this.platform.ready().then(async () => {
      console.log('Platform ready');
      this.statusBar.backgroundColorByHexString('#006675')
      await this.auth.checkToken()
      this.splashScreen.hide();
      this.cometchat.initializeCometChat()
      if (this.platform.is('cordova')) this.notifications.initFirebase()
      this.notifications.onNotification.subscribe(async message => {
        await this.storageService.setUnreadMessages(message, true)
      })
    });

  }

}
