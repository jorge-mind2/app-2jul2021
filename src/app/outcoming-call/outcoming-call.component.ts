import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-outcoming-call',
  templateUrl: './outcoming-call.component.html',
  styleUrls: ['../incoming-call/incoming-call.component.scss', './outcoming-call.component.scss'],
})
export class OutcomingCallComponent implements OnInit {
  @Input() receiver: any

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() { }

  dismiss(cancelled) {
    this.modalCtrl.dismiss({
      cancelled
    });
  }
}
