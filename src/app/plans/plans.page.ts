import { Component, OnInit } from '@angular/core';

import { appConstants } from "../constants.local";
import { ApiService } from '../api-services/api.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
})
export class PlansPage implements OnInit {
  plans: []
  constructor(
    private api: ApiService
  ) {

  }

  ngOnInit() {
    this.api.getPackages().then(res => {
      const plans = res.data
      this.plans = plans
    })
  }

}
