import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-outcoming-call',
  templateUrl: './outcoming-call.component.html',
  styleUrls: ['../incoming-call/incoming-call.component.scss', './outcoming-call.component.scss'],
})
export class OutcomingCallComponent implements OnInit {
  @Input() receiver: any

  constructor(
    private modalCtrl: ModalController,
    private api: ApiService
  ) { }

  ngOnInit() { }

  dismiss(cancelled) {
    this.api.cancelCall(this.receiver.id)
    this.modalCtrl.dismiss({
      cancelled
    });
  }
}
