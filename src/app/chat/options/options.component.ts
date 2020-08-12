import { Component, OnInit } from '@angular/core';
import { PopoverController, Events } from '@ionic/angular';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {

  constructor(
    private popoverCtrl: PopoverController,
    private events: Events
  ) { }

  ngOnInit() { }

  onSelect(option: string) {
    this.events.publish('onSelectOption', option)
  }

}
