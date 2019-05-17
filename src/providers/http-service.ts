import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NativeServiceProvider } from './NativeService';


@Injectable()
export class HttpServiceProvider {

  constructor(public http: HttpClient, public nativeService: NativeServiceProvider) {
    console.log('Hello HttpServiceProvider Provider');
  }


  /**
   * @param showLoading 是否显示loading图标
   */
  get(url, fname?: string, fparam?, showLoading?: boolean): Observable<any> {
    return Observable.create(observer => {
      if (showLoading) this.nativeService.showLoading();
      // if(fparam!=null)fparam['device_uuid']=this.nativeService.getUUID();
      let param = { "fname": fname, "fparam": fparam == null ? null : JSON.stringify(fparam) };
      this.http.get(url, { params: param, observe: 'body', responseType: 'json' }).subscribe(res => {
        if (showLoading) this.nativeService.hideLoading();
        observer.next(res);
      }, err => {
        this.handleError();
        observer.error(err);
      });
    });
  }


  postForm(url, fname?, fparam?, showLoading?: boolean): Observable<any> {
    return Observable.create(observer => {
      if (showLoading) this.nativeService.showLoading();
      // if(fparam!=null)fparam['device_uuid']=this.nativeService.getUUID();
      let param = { "fname": fname, "fparam": fparam == null ? null : JSON.stringify(fparam) };
      this.http.post(url, param, { observe: 'body', responseType: 'json', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe(res => {
        if (showLoading) this.nativeService.hideLoading();
        observer.next(res);
      }, err => {
        if (showLoading) this.nativeService.hideLoading();
        this.handleError();
        observer.error(err);
      });
    });
  }

  /**
   * 
   * @description param为formData 有file,fname, fparam三个属性
   */
  postFile(url, param, headers = {}): Observable<any> {
    return Observable.create(observer => {
      this.nativeService.showLoading();
      this.http.request("POST", url, { body: param, observe: 'body',  responseType: 'json', headers: headers }).subscribe(res => {
        this.nativeService.hideLoading();
        observer.next(res);
      }, err => {
        this.nativeService.hideLoading();
        this.handleError();
        observer.error(err);
      });
    });
    //const req = new HttpRequest("POST", url, data);
    /* return this.http.post(url, null, {params:data, headers: {
      'Content-Type':'undefined'
    }}); */
  }

  handleError() {   //取消loading, 检查网络
      this.nativeService.showToast('获取数据出错');
  }
}
