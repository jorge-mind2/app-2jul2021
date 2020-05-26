import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SignUpPatientPage } from './sign-up-patient.page';
import { TermsPage } from '../terms/terms.page';
import { TermsPageModule } from '../terms/terms.module';

const routes: Routes = [
  {
    path: '',
    component: SignUpPatientPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TermsPageModule
  ],
  entryComponents: [TermsPage],
  declarations: [SignUpPatientPage]
})
export class SignUpPatientPageModule { }
