import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, AlertController, IonicApp, Navbar, ViewController } from 'ionic-angular';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { HttpServiceProvider } from '../../providers/http-service';
import { NativeServiceProvider } from '../../providers/NativeService';

declare var BMap;
declare var BMapLib;
declare var BMAP_ANCHOR_TOP_RIGHT;
declare var BMAP_STATUS_SUCCESS;
declare var BMAP_ANIMATION_BOUNCE;

@Component({
  selector: 'page-baidu-map',
  templateUrl: 'baidu-map.html',
})
export class BaiduMapPage {
  APP_SERVE_URL='http://47.93.237.6:8080/zixun/getData.jsp';
  @ViewChild('map') map_container: ElementRef;
  address = "";
  map: any;//地图对象
  marker: any;//标记
  myIcon: any;
  lon: number = 0;
  lat: number = 0;
  designers: any = [];
  demands: any = [];
  designersMarkers = [];   //存放由designers的坐标生成的marker
  demandsMarkers = [];
  autoComplete=null;    //自动下拉列表对象
  constructor(
    public httpService: HttpServiceProvider,
    public viewCtrl: ViewController,
    public ionicApp: IonicApp,
    private geolocation: Geolocation,
    public nativeService: NativeServiceProvider,
    public http: HttpClient,
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public atrCtrl: AlertController,
  ) {
  
  }

  goBack() {
    //以输入框中的值作为返回值，因为用户可能手动更改输入框中的值
    this.viewCtrl.dismiss({ lat: this.lat, lon: this.lon, address: this.address });
  }

  valueChange(value){
    this.address=value;
  }

  ionViewDidLoad() {
    if (this.map) return;//后面不要刷新页面
    //this.nativeService.showLoading();

    this.map = new BMap.Map(               //创建地图实例
      this.map_container.nativeElement,
      {
        enableMapClick: false,//不允许点击底图
        enableScrollWheelZoom: true,//启动滚轮放大缩小，默认禁用
        enableContinuousZoom: true //连续缩放效果，默认禁用
      }
    );

    let point = new BMap.Point(114.38, 30.52);
    // //设置初始显示中心和地图级别，最小为1，最大是17级，地图级别越大放大程度越大
    // //只有在地图初始化后才可以进行其他操作
    this.map.centerAndZoom(point, 15);

    //如果来自发布任务页面就添加点击地图事件监听，使得可以更改位置
    // if (this.page_type == 1)
    //   this.setMapClickListener();

    //允许使用滚轮放大缩小，默认禁用
    this.map.enableScrollWheelZoom(true);
    //平移缩放，PC端默认位于地图左上方，它包含控制地图的平移和缩放的功能。移动端提供缩放控件，默认位于地图右下方
    // this.map.addControl(new BMap.NavigationControl());
    //比例尺，默认位于地图左下方，显示地图的比例关系  
    this.map.addControl(new BMap.ScaleControl({ offset: new BMap.Size(5, 5), anchor: BMAP_ANCHOR_TOP_RIGHT }));
    //地图类型，默认位于地图右上方（包括地图、卫星、三维）
    // this.map.addControl(new BMap.MapTypeControl());
    //设置地图样式
    // this.map.setMapStyle({ style: "midnight" });
    //仅加载当前视野的markers
    this.map.addEventListener("dragend", () => { //可以进行markers的动态加载
      // this.showAndHideMarker(this.map);
        let point = this.map.getCenter();
        console.log(point.lng + " " + point.lat);
        this.getData(point.lng, point.lat);
    });

    this.map.addEventListener("zoomend", () => { //可以进行markers的动态加载
      // this.showAndHideMarker(this.map);
        let point = this.map.getCenter();
        this.getData(point.lng, point.lat);
    });
    
    //如果没有传入地址就使用当前位置
      this.moveToCurrentPosition();
      this.getData(this.lon, this.lat);
  }


  ionViewDidEnter() {
    // this.getData(); //每次进入页面重新加载
  }

  getData(lon, lat) {
    //此处是因为api中的经纬度搞反了，按照api给的来写吧
    let param = { "lat": lat, "lon": lon };
    this.httpService.get(this.APP_SERVE_URL, "gr_userGeolocation", param).subscribe((res) => {
      if (res['code'] == 0) {
        // [{"user_id":4,"lat":114.275001500000002,"lon":30.5851001700000005}]
        for (let marker of this.designersMarkers) {
            this.map.removeOverlay(marker);
        }
        this.designersMarkers=[];
        this.designers = res['data'];
        this.showOnMap(this.designers, 2);
      }
    });

    this.httpService.get(this.APP_SERVE_URL, "sj_taskGeolocation", param).subscribe((res) => {
      if (res['code'] == 0) {
        // [{"task_id":4,"lat":114.84744385603139,"lon":31.2500090815671818}]
        for (let marker of this.demandsMarkers) {
          this.map.removeOverlay(marker);
      }
      this.demandsMarkers=[];
        this.demands = res['data'];
        this.showOnMap(this.demands, 1);
      }
    });
  }

  showOnMap(data: any, type) {
    if (type == 1) {
      var icon1 = new BMap.Icon("assets/imgs/list_task.png", new BMap.Size(20, 20), { anchor: new BMap.Size(15, 32) });
      this.addMarkersToMap(data, icon1, "red", 1);
    } else {
      var icon2 = new BMap.Icon("assets/imgs/designer.png", new BMap.Size(20, 20), { anchor: new BMap.Size(15, 32) });
      this.addMarkersToMap(data, icon2, "blue", 2);
    }

    //点聚合，当有很多个点会重叠时需要使用
    // new BMapLib.MarkerClusterer(this.map, { markers: this.demandsMarkers });
    // new BMapLib.MarkerClusterer(this.map, { markers: this.designersMarkers });
  };

  addMarkersToMap(markers, myicon, lbl_font_color, type) {
    //var myIcon = new BMap.Icon("http://api.map.baidu.com/img/markers.png");
    if (markers != null)
      for (let marker of markers) {
        let point = new BMap.Point(marker.lon, marker.lat);
        let mapmarker = new BMap.Marker(point, { icon: myicon });
        if (type == 1) {
          this.demandsMarkers.push(mapmarker);
          this.addClickHandlerforDemand(this, marker.task_id, mapmarker);
        }
        else {
          this.designersMarkers.push(mapmarker);
          this.addClickHandlerforDesigner(this, marker.user_id, mapmarker);
        }
      }

    //隐藏不在视野范围的点
    this.showAndHideMarker(this.map);

  }

  addClickHandlerforDemand(p_this, id, marker) {
    marker.addEventListener("click", function (e) {
      p_this.navCtrl.push('DetailPage', { type:1,id: id });
    }
    );
  }
  addClickHandlerforDesigner(p_this, id, marker) {
    marker.addEventListener("click", function (e) {
      p_this.navCtrl.push('DetailPage', { type:0,id: id });
    }
    );
  }

  moveToCurrentPosition() {
    this.nativeService.showLoading();
    //通过本地定位获取gps坐标,如果10s秒没有返回就提示错误信息
    setTimeout(() => {
      if (this.ionicApp._loadingPortal.getActive() != null) {
        this.ionicApp._loadingPortal.getActive().dismiss();
        this.nativeService.showToast("无法定位到当前位置，可能是手机定位没有开启或者应用没有定位权限", 3000);
      }
    }, 3000);
    this.geolocation.getCurrentPosition().then((resp) => {
      //通过百度地图的Convertor类转为百度地图坐标
      var convertor = new BMap.Convertor();
      var pointArr = [];
      //注意百度地图位置的经纬度顺序
      let mpoint = new BMap.Point(resp.coords.longitude, resp.coords.latitude);
      pointArr.push(mpoint);
      convertor.translate(pointArr, 1, 5, (data) => {
        if (data.status === 0) {
          let mIcon = new BMap.Icon("assets/imgs/map_pin.png", new BMap.Size(40, 40), { anchor: new BMap.Size(15, 32) });
          var marker = new BMap.Marker(data.points[0], { icon: mIcon });

          //  var label = new BMap.Label("你的当前位置",{offset:new BMap.Size(20,-10)});
          //  marker.setLabel(label); //添加label

          this.map.addOverlay(marker);
          this.map.setCenter(data.points[0]);
        }
      });
      // this.map.panTo(mpoint);
      console.log("当前地址：" + resp.coords.longitude + "    " + resp.coords.latitude);
      this.nativeService.hideLoading();
    }).catch((error) => {
      this.nativeService.hideLoading();
      console.log('Error getting location', error);
    });
  }

  showAndHideMarker(map) {
    let bound = map.getBounds();   //获取可视区域
    let bssw = bound.getSouthWest();   //可视区域左下角
    let bsne = bound.getNorthEast();   //可视区域右上角
    // console.log("当前地图可视范围是：" + bssw.lng + "," + bssw.lat + "到" + bsne.lng + "," + bsne.lat);

    for (let marker of this.demandsMarkers) {
      if (!bound.containsPoint(marker.getPosition())) {
        // marker.hide();
        this.map.removeOverlay(marker);
      } else this.map.addOverlay(marker);
    }
    for (let marker of this.designersMarkers) {
      if (!bound.containsPoint(marker.getPosition())) {
        this.map.removeOverlay(marker);
      } else this.map.addOverlay(marker);
    }
  }

  setPlace(value) {
    this.map.clearOverlays();    //清除地图上所有覆盖物
    //注意如果用function来定义的话函数里面不能用this来指向本类的变量
    let myFun = () => {
      var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
      this.lat = pp.lat;
      this.lon = pp.lng;
      this.map.centerAndZoom(pp, 18);
      let mIcon = new BMap.Icon("assets/imgs/basic/map_pin.png", new BMap.Size(40, 40), { anchor: new BMap.Size(15, 32) });
      let marker = new BMap.Marker(pp, { icon: mIcon });
      this.map.addOverlay(marker);    //添加标注
    }
    var local = new BMap.LocalSearch(this.map, { //智能搜索
      onSearchComplete: myFun
    });
    local.search(value);
  }

  setMapClickListener() {
    this.map.addEventListener("click", (e) => {
      //根据经纬度查找周围poi
      let geocoder = new BMap.Geocoder();
      geocoder.getLocation(e.point, (result) => {
        // result['addressComponents'].province
        // result['addressComponents'].city
        // result['addressComponents'].district
        // result['addressComponents'].street
        // console.log(result['address']);
        let nearestPOI = null;
        let pois = result['surroundingPois'];
        for (let poi of pois) {
          // console.log(poi['title']);
          // console.log(poi['address']);
          //和点击位置之间的距离
          let distance = this.map.getDistance(e.point, poi['point']).toFixed(2);
          if (distance < 30) {
            if (nearestPOI == null) nearestPOI = poi;
            if (distance < this.map.getDistance(e.point, nearestPOI['point']).toFixed(2))
              nearestPOI = poi;
          }
        }
        if (nearestPOI != null) {
          this.address = nearestPOI['address'] + nearestPOI['title'];
          this.autoComplete.setInputValue(this.address);
          this.lat = nearestPOI['point'].lat;
          this.lon = nearestPOI['point'].lng;
        } else {
          this.address = result['address'];
          this.autoComplete.setInputValue(this.address);
          this.lat = e.point.lat;
          this.lon = e.point.lng;
        }
        //每次添加前清除所由的覆盖物
        this.map.clearOverlays();
        let mIcon = new BMap.Icon("assets/imgs/basic/map_pin.png", new BMap.Size(40, 40), { anchor: new BMap.Size(15, 32) });
        let marker = new BMap.Marker(new BMap.Point(this.lon, this.lat), { icon: mIcon });
        this.map.addOverlay(marker);    //添加标注
      }, { poiRadius: 30 });
    });
  }

  setInputSearchListener() {
    //建立一个自动完成的对象
    this.autoComplete= new BMap.Autocomplete({ "input": "suggestId", "location": this.map });
    if(this.address!="")
    this.autoComplete.setInputValue(this.address);
    //注意如果不用箭头函数里面不能用this来指向本类的变量
    this.autoComplete.addEventListener("onhighlight", (e) => {  //鼠标放在下拉列表上的事件
      var str = "";
      var _value = e.fromitem.value;
      var value = "";
      if (e.fromitem.index > -1) {
        value = _value.province + _value.city + _value.district + _value.street + _value.business;
      }
      str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + "hhhhhhhhh";

      value = "";
      if (e.toitem.index > -1) {
        _value = e.toitem.value;
        value = _value.province + _value.city + _value.district + _value.street + _value.business;
      }
      console.log(value);
      str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + "tttttttt";
      document.getElementById("searchResultPanel").innerHTML = str;
    });

    var myValue;
    //注意如果不用箭头函数里面不能用this来指向本类的变量
    this.autoComplete.addEventListener("onconfirm", (e) => {    //鼠标点击下拉列表后的事件
      console.log("点击了搜索结果");
      var _value = e.item.value;
      myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
      document.getElementById("searchResultPanel").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
      this.address=myValue;
      this.setPlace(myValue);
    });
  }

  //显示提示列表
  showResults(){
    console.log("获取焦点了");
    if(this.autoComplete!=null)
    this.autoComplete.show();
  }

}