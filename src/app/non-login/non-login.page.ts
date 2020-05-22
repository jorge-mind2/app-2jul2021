import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Zoom } from '@ionic-native/zoom/ngx';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';

@Component({
  selector: 'page-nonlogin',
  templateUrl: 'non-login.page.html',
  styleUrls: ['non-login.page.scss']
})
export class NonLoginPage {
  // Token variables (Retrieve from Rest API)
  zoomToken = '';
  zoomAccessToken = '';
  userId = '';

  // Meeting variables
  meetingNumber = null;
  meetingPassword = '';
  displayName = 'Mind2 Demo';
  language = 'en-US';

  constructor(
    private toastCtrl: ToastController,
    private zoomService: Zoom,
  ) { }

  async presentToast(text) {
    const toast = await this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  /**
   * Join a meeting.
   */
  joinMeeting() {
    console.log('Going to join meeting');
    // Prepare meeting option
    const options = {
      no_driving_mode: true,
      no_invite: true,
      no_meeting_end_message: true,
      no_titlebar: false,
      no_bottom_toolbar: false,
      no_dial_in_via_phone: true,
      no_dial_out_to_phone: true,
      no_disconnect_audio: true,
      no_share: true,
      no_audio: true,
      no_video: true,
      no_meeting_error_message: true
    };
    // Call join meeting method.
    this.zoomService.joinMeeting(this.meetingNumber, this.meetingPassword, this.displayName, options)
      .then((success) => {
        console.log(success);
        this.presentToast(success);
        this.meetingNumber = null;
        this.meetingPassword = null;
      }).catch((error) => {
        console.log(error);
        this.presentToast(error);
      });
  }

  /**
   * Start an existing meeting with ZAK.
   */
  startMeetingWithZAK() {
    console.log('Going to start meeting with ZAK');
    // Prepare meeting option
    const options = {};
    // Call start meeting method
    this.zoomService.startMeetingWithZAK(this.meetingNumber,
      this.displayName, this.zoomToken, this.zoomAccessToken, this.userId, options).then((success) => {
        console.log(success);
        this.presentToast(success);
        this.meetingNumber = null;
        this.meetingPassword = null;
      }).catch((error) => {
        console.log(error);
        this.presentToast(error);
      });
  }

  /**
   * Change the in-meeting language.
   */
  setLanguage() {
    this.zoomService.setLocale(this.language).then((success) => {
      console.log(success);
      this.presentToast(success);
    }).catch((error) => {
      console.log(error);
      this.presentToast(error);
    });
  }

  /**
   * Init CometChat Call
  */
  callToKevin() {
    var receiverID = "user3";
    var callType = CometChat.CALL_TYPE.VIDEO;
    var receiverType = CometChat.RECEIVER_TYPE.USER;

    var call = new CometChat.Call(receiverID, callType, receiverType);

    CometChat.initiateCall(call).then(
      outGoingCall => {
        console.log("Call initiated successfully:", outGoingCall);
        // perform action on success. Like show your calling screen.
      },
      error => {
        console.log("Call initialization failed with exception:", error);
      }
    );
  }
}
