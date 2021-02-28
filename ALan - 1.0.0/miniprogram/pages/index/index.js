//index.js
const app = getApp()

Page({
  data: {
    cnt:0,
    newsmsg: "",
    marqueePace: 1,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    size: 14,
    orientation: 'left',//滚动方向
    interval: 20, // 时间间隔
  },
  onLoad:function() {
    this.onGetNews()
  },
  onShow: function () {
    // 页面显示
    var that = this;
    var length = that.data.newsmsg.length * that.data.size;//文字长度
    if(length && !this.data.cnt) {
      var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
      that.setData({
        length: length,
        windowWidth: windowWidth,
      });
      this.data.cnt=1;
      that.runMarquee();// 水平一行字滚动完了再按照原来的方向滚动
    }
  },
  onGetNews: function () {
    var that = this
    wx.cloud.database().collection("news").get({
      success(res) {
        that.setData({
          newsmsg:res.data[0].data
        })
        that.onShow()
      }
    })
  },
  runMarquee: function () {
    var that = this;
    var interval = setInterval(function () {
      //文字一直移动到末端
      if (-that.data.marqueeDistance < that.data.length) {
        that.setData({
          marqueeDistance: that.data.marqueeDistance - that.data.marqueePace,
        });
      } else {
        clearInterval(interval);
        that.setData({
          marqueeDistance: that.data.windowWidth
        });
        that.runMarquee();
      }
    }, that.data.interval);
  },

  classify:function(e) {
    //console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../product/product?id=' + e.currentTarget.dataset.id,
    })
  }
})
