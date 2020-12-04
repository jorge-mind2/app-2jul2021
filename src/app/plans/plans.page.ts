import { Component, OnInit } from '@angular/core';

import { appConstants } from "../constants.local";
import { ApiService } from '../api-services/api.service';
import { StorageService } from '../api-services/storage.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.page.html',
  styleUrls: ['./plans.page.scss'],
})
export class PlansPage implements OnInit {
  plans: []
  discount_percent: number = 0
  constructor(
    private api: ApiService,
    private storage: StorageService
  ) {

  }

  async ngOnInit() {
    const user = await this.storage.getCurrentUser()
    if (user.discount_percent && +user.discount_percent > 0) this.discount_percent = +user.discount_percent
    this.api.getPackages().then(res => {
      const plans = res.data
      this.plans = plans.map(plan => {
        plan.amount_discount = plan.amount - (plan.amount * (this.discount_percent / 100))
        return plan
      })
    })
  }

}
