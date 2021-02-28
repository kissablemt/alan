//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    manageText:["进入产品管理模式","关闭产品管理模式"],
    isRoot:false
  },

  onLoad:function() {
    wx.setNavigationBarTitle({
      title: '我的事务',
    })
  },

  onShow: function() {
    this.setData({
      isRoot: app.globalData.isRoot,
      isManaging: app.globalData.isManaging
    })
  },

  goOrder:function() {
    wx.navigateTo({
      url: '../order/order',
    })
  },

  goProduct: function() {
    app.globalData.isManaging = !app.globalData.isManaging;
    this.setData({
      isManaging: app.globalData.isManaging
    })
  }

})
