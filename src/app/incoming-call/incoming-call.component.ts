import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-incoming-call',
  templateUrl: './incoming-call.component.html',
  styleUrls: ['./incoming-call.component.scss'],
})
export class IncomingCallComponent implements OnInit {
  @Input() caller: any

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() { }

  dismiss(answered) {
    this.modalCtrl.dismiss({
      answered
    });
  }

}
