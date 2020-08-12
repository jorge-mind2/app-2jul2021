import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx'
import { Crop } from '@ionic-native/crop/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import { IonicStorageModule, Storage } from '@ionic/storage';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonPagesModule } from './common/common-pages.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { ApiInterceptor } from './interceptors/api.interceptor';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { environment } from "../environments/environment";
import { IncomingCallComponent } from './incoming-call/incoming-call.component';

export function jwtOptionsFactory(storage) {
  return {
    tokenGetter: () => {
      return storage.get('accessToken');
    },
    whitelistedDomains: [environment.API_BASE_URL]
  }
}

@NgModule({
  declarations: [AppComponent, IncomingCallComponent],
  entryComponents: [
    IncomingCallComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: '__mind2'
    }),
    AppRoutingModule,
    CommonPagesModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [Storage],
      }
    })
  ],
  providers: [
    AndroidPermissions,
    StatusBar,
    SplashScreen,
    Device,
    FirebaseX,
    LocalNotifications,
    Camera,
    File,
    Crop,
    FileTransfer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
