import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule, ToastController } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { BaiduMapPage } from '../pages/baidumap/baidu-map';

import { Geolocation } from '@ionic-native/geolocation';
import { HttpServiceProvider } from '../providers/http-service';
import { NativeServiceProvider } from '../providers/NativeService';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    MyApp,
    BaiduMapPage
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    BaiduMapPage
  ],
  providers: [
    
    ToastController,
    StatusBar,
    SplashScreen,
    Geolocation,
    HttpServiceProvider,
    NativeServiceProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
