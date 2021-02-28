//app.js
App({
  globalData: {
    cart: [],
    goods: [],
    openid: "",
    isRoot: false,
    isManaging: false,
  },

  onLaunch: function () {
    var that = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    this.onGetProduct()
    this.onGetCart()
    this.onGetRoot()
  },

  onHide: function () {
    this.setCart()
    console.log('app hide')
  },

  onGetCart: function () {
    try {
      const ct = wx.getStorageSync("_CART")
      if (ct)
        this.globalData.cart = ct
    } catch (e) { console.log(e) }
  },
  setCart: function () {
    try {
      wx.setStorageSync("_CART", this.globalData.cart)
    } catch (e) { console.log(e) }
  },

  onGetOpenid: function () {
    var that = this
    var openid = wx.getStorageSync("_OPENID")
    //openid="GUEST"
    if (!openid) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          that.globalData.openid = res.result.openid
          wx.setStorageSync("_OPENID", res.result.openid)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    } else {
      that.globalData.openid = openid
    }
  },

  onGetRoot: function () {
    this.onGetOpenid()
    var that = this
    wx.cloud.callFunction({
      name: 'getRoot',
      data: { openid: that.globalData.openid },
      success(res) {
        that.globalData.isRoot = res.result.isRoot
        console.log(res.result.isRoot ? "管理员登入" : "普通用户登入")
      }
    })
  },
  //云函数 获得产品列表
  onGetProduct: function () {
    var that = this
    wx.cloud.callFunction({
      name: "getProduct",
      data: {},
      success: res => {
        console.log("载入商品", res.result.data.length)
        that.globalData.goods = res.result.data
      },
      fail: err => {
        console.error('[云函数] [getProduct] 调用失败', err)
      }
    })
  },

})
