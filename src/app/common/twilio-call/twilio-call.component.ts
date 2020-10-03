import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/api-services/api.service';
import { TwilioService } from '../../api-services/twilio.service';


@Component({
  selector: 'app-twilio-call',
  templateUrl: './twilio-call.component.html',
  styleUrls: ['./twilio-call.component.scss'],
})
export class TwilioCallComponent implements OnInit {
  message1: string;
  accessToken: string;
  roomName: string;
  username: string;
  @ViewChild('scrollArea') content: IonContent;
  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;

  video_token: any;

  constructor(
    public modalCtrl: ModalController,
    public twilioService: TwilioService,
    public api: ApiService,
  ) {

    /* this.twilioService.msgSubject.subscribe(r => {
      this.message1 = r;
    }); */

  }

  ngOnInit() {

    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
    this.connect();
  }

  //Video call

  log(message) {
    this.message1 = message;
  }

  disconnect() {
    console.log(this.twilioService.room);

    if (this.twilioService.room && this.twilioService.room !== null) {
      this.twilioService.room.disconnect();
      this.twilioService.room = null;
      this.twilioService.previewing = false
      this.dismiss()
    }
  }


  async connect() {
    const currentToken = await this.twilioService.getToken()
    this.accessToken = currentToken;
    const height = document.getElementById('local').offsetHeight
    const width = document.getElementById('local').clientWidth
    console.log(height);
    return console.log(width);


    return this.twilioService.connectToRoom(currentToken, {
      name: this.roomName,
      audio: true,
      video: {
        facingMode: 'user', width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 640, ideal: 1080 },
        aspectRatio: 1.777777778
      }
    })
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }



}
