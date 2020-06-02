import { Component, OnInit } from '@angular/core';

import { appConstants } from "../constants.local";

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
})
export class PlansPage implements OnInit {
  plans = appConstants.PLANS
  constructor() {
    console.log(this.plans);

  }

  ngOnInit() {
  }

}
