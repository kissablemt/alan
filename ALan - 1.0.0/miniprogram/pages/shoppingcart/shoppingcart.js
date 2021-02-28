// miniprogram/pages/shoppingcart.js
const app=getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    cart: [],
    checkAll: false,
    totalPrice: 0,

    next_icon: ">",
    prev_icon: "<",
    modalHide: true,
    pageShow: 1,
    paypic: [["wx-pay-crb.jpg", "ali-pay-crb.jpg"], ["wx-pay-hhl.jpg", "ali-pay-hhl.jpg"]],
    curpic: 0,
    curper: 0,

    curOrder: "",
    temp: 0
  },
  
  //事件处理函数
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的小宝匣',
    })
    //console.log('Shoppingcart: onLoad')
  },

  onShow: function () {
    var that=this
    this.getCart()
    this.setData({
      mobile: wx.getStorageSync('_MOBILE'),
      address: wx.getStorageSync('_ADDRESS'),
      modalHide: that.data.pageShow!=3,
    })
    //console.log('Shoppingcart: onShow')
  },

  onHide: function () {
    //console.log('Shoppingcart: onHide')
    this.setCart()
  },

  onPullDownRefresh: function () {
    this.getCart();
    //console.log('Shoppingcart: onPullDownRefresh')
  },

  //购物车列表获取与保存
  getCart: function() {
    var ck = wx.getStorageSync('_CART_CHECKALL') 
    var ct = app.globalData.cart
    this.setData({
      cart: ct,
      checkAll: ck
    })
    this.getPrice()
  },
  setCart: function() {
    try{
      wx.setStorageSync('_CART_CHECKALL', this.data.checkAll)
      wx.setStorageSync("_CART", app.globalData.cart)
    } catch(e) { console.log(e) }
  },

  //选择框  
  selectOne: function(e) {
    var idx = e.currentTarget.dataset.index
    var ct=this.data.cart
    var chk = this.data.checkAll
    ct[idx].selected = !ct[idx].selected
    if (!ct[idx].selected)
      chk=false
    this.setData({
      cart: ct,
      checkAll: chk
    })
    this.getPrice()
    //console.log("Shoppingcart: selectOne =", idx)
  },
  selectAll: function(e) {
    var that=this;
    var chk=!that.data.checkAll
    var ct=this.data.cart;
    for(let i=0; i<ct.length; ++i) {
      ct[i].selected=chk;
    }
    this.setData({
      cart: ct,
      checkAll: chk
    })
    this.getPrice()
    //console.log("Shoppingcart: selectAll")
  }, 

  //商品加减
  addOne: function(e) {
    var idx = e.currentTarget.dataset.index
    var ct=this.data.cart
    ct[idx].num+=1
    this.setData({
      cart:ct
    })
    if(ct[idx].selected)
      this.getPrice()
    //console.log("Shoppingcart: addOne =", idx)
  },
  subOne: function (e) {
    var idx = e.currentTarget.dataset.index
    var ct = this.data.cart
    if(ct[idx].num==1) {
      wx.showToast({
        title: '数量不能少于1哦~（右上角可删除）',
        icon: 'none'
      })
      return ;
    }
    ct[idx].num -= 1
    this.setData({
      cart: ct
    })
    if (ct[idx].selected)
      this.getPrice()
    //console.log("Shoppingcart: subOne =", idx)
  },

  //删除
  deleteOne: function(e) {
    var idx = e.currentTarget.dataset.index
    var ct=this.data.cart
    ct.splice(idx, 1)
    this.setData({
      cart: ct
    })
    this.getPrice()
    //console.log("Shoppingcart: deleteOne =", idx)
  },

  //计算价格
  getPrice: function() {
    var tot=0
    var cTot=0;
    const ct=this.data.cart
    for(let i=0; i<ct.length; ++i) {
      if(ct[i].selected) 
        tot+=ct[i].num*ct[i].price
      cTot += ct[i].num * ct[i].price
    }
    this.setData({
      totalPrice: tot,
      checkAll: cTot==tot && tot
    })
    this.setCart()
    //console.log("Shoppingcart: getPrice =", tot)
  },

  //结算
  balance: function() {
    if(this.data.totalPrice==0) {
      wx.showToast({
        title: '您还没选中呢',
        icon: 'none'
      })
      return ;
    }
    wx.redirectTo({
      url: '../detail/detail',
    })
  },

})