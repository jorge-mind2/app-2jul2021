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
import { ApiService } from './api-services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  private rootPage: string = 'welcome';
  loddgerUser: any
  videoCallModal: HTMLIonModalElement
  callInProgress: boolean = false
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
    private twilioService: TwilioService,
    private api: ApiService
  ) {
    this.initializeApp();

  }

  initializeApp() {
    this.platform.ready().then(async () => {
      console.log('Platform ready');
      this.statusBar.backgroundColorByHexString('#006675')
      this.subscribeToGeneralEvents()
      await this.auth.checkToken()
      if (this.platform.is('cordova')) this.notifications.initFirebase()
      this.splashScreen.hide()
    });

  }

  subscribeToGeneralEvents() {

    this.auth.authenticationState.subscribe(async state => {
      const userType = await this.storageService.getUserType();
      console.log('userType', userType);

      if (userType && state) {
        if (!this.twilioService.twilioConnected) await this.twilioService.login()
        return true;
      }
      else if (state === false) {
        await this.twilioService.logout()
      }
      return this.navCtrl.navigateRoot(this.rootPage)
    })
    this.notifications.onAssignedTherapist.subscribe(notification => this.getMyTherapist())
    this.notifications.onMessageReceived.subscribe(async notification => {
      console.log('this.notifications.onMessageReceived', notification);

      // recive notificación si está corriendo en foreground la app
      const notificationData = notification.data || null

      const currentRoute = this.router.url
      if (notificationData.type == 'call' && !this.callInProgress) {
        this.callInProgress = true;
        const incomingCallModall = await this.twilioService.presentIncomingCallScreen(notificationData.caller, notificationData.callerId)
        if (incomingCallModall) incomingCallModall.onDidDismiss().finally(() => this.callInProgress = false)
      }
      if (notificationData.type == 'message' && currentRoute.includes('/chat') || currentRoute.includes('/support')) {
        notification.show_local_notification = false
      }
      if (notification.show_local_notification) return this.notifications.showLocalNotification(notification.id, notification.body, notification.title, notificationData)

    })
    this.notifications.onCallAnswered.subscribe(async answered => {
      await this.twilioService.dismissIncomingCallModal()
      if (answered) {
        console.log('onCallAnswered');
        await this.openCallComponent()
      }
    })
    this.notifications.onMissedCall.subscribe(async notification => {
      await this.twilioService.dismissIncomingCallModal()
    })

    this.notifications.onRejectedCall.subscribe(async notification => {
      console.log('onRejectedCall', notification);
      await this.twilioService.dismissOutcomingCallModal()
    })

    this.twilioService.onCallAccepted.subscribe(async answered => {
      await this.twilioService.dismissIncomingCallModal()
      if (answered) {
        console.log('onCallAccepted');
        await this.openCallComponent()
      }
    })

    this.twilioService.onChannelUpdated.subscribe(async data => {
      await this.storageService.setUnreadMessages(data.channel, true)
    })
  }

  async getMyTherapist() {
    const therapist = await this.api.getMyTherapist()
    const currentUser = await this.storageService.getCurrentUser()
    const channels = [
      currentUser.channels.find(channel => channel.type == 'support'),
      therapist.channel
    ]
    await this.storageService.updateCurrentUser({ therapist, channels })
  }

  async openCallComponent() {
    if (this.videoCallModal) return
    console.log('PRESENT VIDEO CALL MODAL');
    this.videoCallModal = await this.modalCtrl.create({
      component: VideoCallComponent,
      componentProps: {
      }
    });
    this.videoCallModal.onDidDismiss().finally(() => {
      this.videoCallModal = null
      this.callInProgress = false
    })
    return await this.videoCallModal.present()
  }

}
