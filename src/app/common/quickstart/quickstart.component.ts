import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSlides, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-quickstart',
  templateUrl: './quickstart.component.html',
  styleUrls: ['./quickstart.component.scss'],
})
export class QuickstartComponent implements OnInit {
  @ViewChild('welcomeSlide') slides: IonSlides;
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    allowSlideNext: false,
  };
  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() { }

  async swipeNext() {
    await this.slides.lockSwipeToNext(false)
    return await this.slides.slideNext().finally(async () => await this.slides.lockSwipeToNext(true))
  }

  closeSlides() {
    this.modalCtrl.dismiss()
  }

}
