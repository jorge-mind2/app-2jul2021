import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', loadChildren: './welcome/welcome.module#WelcomePageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginModule', },
  { path: 'sign-up-patient', loadChildren: './sign-up-patient/sign-up-patient.module#SignUpPatientPageModule' },
  { path: 'sign-up-therapist', loadChildren: './sign-up-therapist/sign-up-therapist.module#SignUpTherapistPageModule' },
  { path: 'welcome', loadChildren: './welcome/welcome.module#WelcomePageModule' },
  { path: 'profile', loadChildren: './profile/profile.module#ProfilePageModule', canActivate: [AuthGuard] },
  { path: 'home', loadChildren: './home/home.module#HomePageModule', canActivate: [AuthGuard] },
  { path: 'support', loadChildren: './support/support.module#SupportPageModule', canActivate: [AuthGuard] },
  { path: 'home-therapist', loadChildren: './home-therapist/home-therapist.module#HomeTherapistPageModule', canActivate: [AuthGuard] },
  { path: 'payment-methods', loadChildren: './payment-methods/payment-methods.module#PaymentMethodsPageModule', canActivate: [AuthGuard] },
  { path: 'add-card', loadChildren: './add-card/add-card.module#AddCardPageModule', canActivate: [AuthGuard] },
  { path: 'plans', loadChildren: './plans/plans.module#PlansPageModule', canActivate: [AuthGuard] },
  { path: 'my-patients', loadChildren: './my-patients/my-patients.module#MyPatientsPageModule', canActivate: [AuthGuard] },
  { path: 'chat', loadChildren: './chat/chat.module#ChatPageModule', canActivate: [AuthGuard] },
  { path: 'password-recovery', loadChildren: './password-recovery/password-recovery.module#PasswordRecoveryPageModule', canActivate: [AuthGuard] },
  { path: 'checkout', loadChildren: './checkout/checkout.module#CheckoutPageModule', canActivate: [AuthGuard] },
  { path: 'edit-profile', loadChildren: './edit-profile/edit-profile.module#EditProfilePageModule', canActivate: [AuthGuard] },
  { path: 'schedule', loadChildren: './schedule/schedule.module#SchedulePageModule', canActivate: [AuthGuard] }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
