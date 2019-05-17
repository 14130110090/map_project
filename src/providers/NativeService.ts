import { Injectable } from '@angular/core';
import { Platform, ToastController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class NativeServiceProvider {
  loading: Loading;
  constructor(
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
  ) { }

 
  /**
     * 是否真机环境
     */
  isMobile(): boolean {
    //mobile包括android、ios、ipad等，mobileweb是在真机上的浏览器中
    return this.platform.is('mobile') && !this.platform.is('mobileweb');
  }

  /**
   * 是否android真机环境，先判断是否真机，然后判断是否android
   */
  isAndroid(): boolean {
    return this.isMobile() && this.platform.is('android');
  }

  /**
   * 是否ios真机环境，包括运行ios的设备、ipad、iphone
   */
  isIos(): boolean {
    return this.isMobile() && (this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone'));
  }
 
  /**
   * 如果是真机环境，调用原生toast，否则调用自带的ToastController来显示。
   * @param message 信息内容
   * @param duration 显示时长(默认2000)
   * @param position 显示位置(默认为bottom)，还可以为top和middle(或center)
   */
  showToast(message: string = '完成', duration: number = 1500, position = "bottom"): void {
    if (this.isMobile()) {
      //注意show()方法返回的是observable，而且一定要调用subscribe才会显示
      //原生toast显示位置为top、center、bottom
        this.toastCtrl.create({
          message: message,
          duration: duration,
          position: 'bottom',
          showCloseButton:false
        }).present();
    }
  };

  /**
   * 如果http请求已经显示loading就不显示，
   * 如果当前已经有打开的loadling也不显示，否则一直显示指定内容的loading，
   * 如果不手动关闭，请求时间结束（默认20s）后自动关闭。
   * @param content 显示的内容
   */
  showLoading(content: string = ''): void {
    // if (!this.globalData.showLoading) {
    //   return;
    // }
    // if (!this.loadingIsOpen) {   //如果没有打开
    //   this.loadingIsOpen = true;
    //   this.loading = this.loadingCtrl.create({
    //     content: content
    //   });
    //   this.loading.present();
    //   setTimeout(() => {
    //     this.loadingIsOpen && this.loading.dismiss();
    //     this.loadingIsOpen = false;
    //   }, REQUEST_TIMEOUT);
    // }

    this.loading = this.loadingCtrl.create({ content: content });
    this.loading.present();
    setTimeout(() => { }, 20000);
  };

  /**
   * 如果showLoading为false，则设为true，并且如果当前已经打开loading，关闭之。
   */
  hideLoading(): void {

    //判断是否正在显示
    if (this.loading != null) this.loading.dismiss();
  };

  //移除字符串的市、自治区、区、县
  replaceCityName(name: string) {
    var patt = new RegExp("市|自治区|自治州|自治县|区|县", "gm");
    return name.replace(patt, "");
  }
}
