import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './welcome/welcome.module#WelcomePageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginModule' },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'support', loadChildren: './support/support.module#SupportPageModule' },
  { path: 'sign-up', loadChildren: './sign-up/sign-up.module#SignUpPageModule' },
  { path: 'welcome', loadChildren: './welcome/welcome.module#WelcomePageModule' },
  { path: 'sign-up-patient', loadChildren: './sign-up-patient/sign-up-patient.module#SignUpPatientPageModule' },
  { path: 'sign-up-therapist', loadChildren: './sign-up-therapist/sign-up-therapist.module#SignUpTherapistPageModule' },
  { path: 'home-therapist', loadChildren: './home-therapist/home-therapist.module#HomeTherapistPageModule' },
  { path: 'call-patient', loadChildren: './call-patient/call-patient.module#CallPatientPageModule' },
  { path: 'call-therapist', loadChildren: './call-therapist/call-therapist.module#CallTherapistPageModule' },
  { path: 'service-chat', loadChildren: './service-chat/service-chat.module#ServiceChatPageModule' },
  { path: 'payment-methods', loadChildren: './payment-methods/payment-methods.module#PaymentMethodsPageModule' },
  { path: 'add-card', loadChildren: './add-card/add-card.module#AddCardPageModule' },
  { path: 'plans', loadChildren: './plans/plans.module#PlansPageModule' },
  { path: 'my-patients', loadChildren: './my-patients/my-patients.module#MyPatientsPageModule' },
  { path: 'chat', loadChildren: './chat/chat.module#ChatPageModule' },
  { path: 'video-call', loadChildren: './video-call/video-call.module#VideoCallPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
