import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/api-services/api.service';
import { StorageService } from 'src/app/api-services/storage.service';
import { TwilioService } from 'src/app/api-services/twilio.service';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
})
export class VideoCallComponent implements OnInit {
  message1: string;
  roomName: string;
  username: string;
  @ViewChild('scrollArea') content: IonContent;
  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;
  @Input() isHost: boolean

  video_token: any;
  videoActived = true
  audioActived = true
  public timeBegan = null;
  public timeStopped: any = null;
  public stoppedDuration: any = 0;
  public started = null;
  public running = false;
  public blankTime = "00:00.000";
  public time = "00:00.000";

  constructor(
    public modalCtrl: ModalController,
    public twilioService: TwilioService,
    private storage: StorageService,
    private api: ApiService
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
    }
    this.storage.setCurrentRoom(null)
    if (this.isHost) {
      this.api.sendEndCall(0)
    }
    this.dismiss()
  }

  toggleFullScreen(clicked) {
    const elementClicked = document.getElementById(clicked)
    if (elementClicked.classList.contains('fullscreen-video')) return

    const smallVideo = document.querySelector('.small-video')
    const fullscreenVideo = document.querySelector('.fullscreen-video')
    smallVideo.classList.add('fullscreen-video')
    smallVideo.classList.remove('small-video')
    fullscreenVideo.classList.add('small-video')
    fullscreenVideo.classList.remove('fullscreen-video')
    var smallVideos = smallVideo.querySelectorAll('video')
    var bigVideos = fullscreenVideo.querySelectorAll('video')
    for (let i = 0; i < smallVideos.length; i++) {
      var video = smallVideos[i]
      video.style.width = 'auto';
    }
    for (let i = 0; i < bigVideos.length; i++) {
      var video = bigVideos[i]
      video.style.width = '100%';
    }
  }

  toggleVideo() {
    this.videoActived = !this.videoActived
    this.twilioService.toggleCamera(this.videoActived)
  }

  toggleAudio() {
    this.audioActived = !this.audioActived
    this.twilioService.toggleAudio(this.audioActived)
  }

  async connect() {
    try {
      this.twilioService.presentLoading('Conectando...')
      const currentToken = await this.twilioService.getVideoToken()
      const currentRoom = await this.storage.getCurrentRoom()
      const height = document.getElementById('local').offsetHeight
      const width = document.getElementById('local').clientWidth
      console.log('height', height);
      console.log('width', width);

      return this.twilioService.connectToRoom(currentToken, {
        name: currentRoom,
        audio: true,
        video: {
          height: 720,
          frameRate: 24,
          width: 1280,
          facingMode: 'user',
          aspectRatio: 1.777777778
        },
        bandwidthProfile: {
          video: {
            mode: 'collaboration',
            renderDimensions: {
              high: {
                height: 1080,
                width: 1980
              },
              standard: {
                height: 720,
                width: 1280
              },
              low: {
                height: 176,
                width: 144
              }
            }
          }
        }
      })

    } catch (error) {
      if (await this.twilioService.loadingCtrl.getTop()) this.twilioService.loadingCtrl.dismiss()
      this.dismiss()
    }
  }

  start(): void {
    if (this.running) return;

    if (this.timeBegan === null) {
      this.reset();
      this.timeBegan = new Date();
    }

    if (this.timeStopped !== null) {
      let newStoppedDuration: any = (+new Date() - this.timeStopped)
      this.stoppedDuration = this.stoppedDuration + newStoppedDuration;
    }

    this.started = setInterval(this.clockRunning.bind(this), 10);
    this.running = true;
  }

  stop(): void {
    this.running = false;
    this.timeStopped = new Date();
    return clearInterval(this.started);
  }

  reset(): void {
    this.running = false;
    this.stoppedDuration = 0;
    this.timeBegan = null;
    this.timeStopped = null;
    this.time = this.blankTime;
    return clearInterval(this.started);
  }

  zeroPrefix(num: number, digit: number): string {
    let zero = '';
    for (let i = 0; i < digit; i++) {
      zero += '0';
    }
    return (zero + num).slice(-digit);
  }

  clockRunning(): void {
    let currentTime: any = new Date()
    let timeElapsed: Date = new Date(currentTime - this.timeBegan - this.stoppedDuration)
    let hour = timeElapsed.getUTCHours()
    let min = timeElapsed.getUTCMinutes()
    let sec = timeElapsed.getUTCSeconds();
    this.time =
      this.zeroPrefix(hour, 2) + ":" +
      this.zeroPrefix(min, 2) + ":" +
      this.zeroPrefix(sec, 2);
  };

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }



}
