import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.scss'],
})
export class IncomingCallComponent implements OnInit {
  @Input() caller: any

  constructor(
    private modalCtrl: ModalController,
    private api: ApiService
  ) { }

  ngOnInit() { }

  dismiss(answered) {
    if (!answered) this.api.sendRejectCall(this.caller.id)
    else this.api.sendAcceptCall(this.caller.id)
    this.modalCtrl.dismiss({
      answered
    });
  }

}
