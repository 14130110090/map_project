import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
  page_type = 0;
  id;
  detail;
  constructor(

    public navCtrl: NavController, public navParams: NavParams) {
    this.page_type = navParams.get("type");
    this.id = navParams.get("id");
    if (this.id == 1) {
      this.detail = {
        "所在地址": "武汉市珞喻路37号",
        "建筑物名称": "武汉大学国家网络安全学院行政楼",
        "建筑物总层数": "12层",
        "所在楼层单元": "10楼102户",
        "联系方式": "1299999999",
        "房屋结构": "钢架结构",
        "周边环境": ['assets/imgs/timg.jpg', 'assets/imgs/timg1.jpg', "assets/imgs/timg2.jpg", 'assets/imgs/timg3.jpg'],
      }
    } else {
      this.detail = {
        "所在地址": "合肥市长江西路130号",
        "建筑物名称": "安徽农业大学资源环境学院行政楼",
        "建筑物总层数": "12层",
        "所在楼层单元": "10楼102户",
        "联系方式": "1299999999",
        "房屋结构": "钢架结构",
        "周边环境": ['assets/imgs/timg4.jpg', 'assets/imgs/timg5.jpg', "assets/imgs/timg6.jpg", 'assets/imgs/timg1.jpg'],
      }
    }
  }

  ionViewDidLoad() {

  }

}
