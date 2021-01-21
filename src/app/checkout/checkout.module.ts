import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CheckoutPage } from './checkout.page';
import { AddCouponComponent } from './add-coupon/add-coupon.component';
import { CommonPagesModule } from '../common/common-pages.module';

const routes: Routes = [
  {
    path: '',
    component: CheckoutPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    CommonPagesModule
  ],
  providers: [CurrencyPipe],
  declarations: [
    CheckoutPage,
    AddCouponComponent
  ],
  entryComponents: [AddCouponComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CheckoutPageModule { }
