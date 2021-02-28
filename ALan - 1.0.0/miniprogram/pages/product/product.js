const app = getApp()

Page({
  data: {
    goods: [],
    cls: "不选择", //分类
    clsText: ["不选择", "护肤","面膜","彩妆","零食酒水","身体","生活","套装","香水"],
    isManaging: false,
    retrieval: []
  },

  //事件处理函数
  onLoad: function (options) {
    //console.log(options)
    this.setData({
      cls: this.data.clsText[options.id]
    })
    this.classify({ detail: { value: options.id } })
    
    wx.setNavigationBarTitle({
      title: '藏宝洞',
    })
  },

  onShow: function () {
    this.setData({
      isManaging: app.globalData.isManaging,
      goods: app.globalData.goods,
    })
  },


  //加入购物车
  addToCart: function (e) {
    var that = this
    var ele = e.currentTarget.dataset.ele
    var id = ele._id
    var ct = app.globalData.cart
    var ex = false
    ct.reverse()
    for (let i = 0; i < ct.length; ++i) {
      if (ct[i]._id == id) {
        ex = true
        break
      }
    }
    if (ex) {
      wx.showToast({
        title: '已在宝匣啦~',
      })
    } else {
      //加入新属性
      ele.num = 1
      ele.selected = false

      ct.push(ele)
      wx.showToast({
        title: '已加入小宝匣',
      })
    }
    ct.reverse()
    //console.log('Product: addToCart =', id)
  },

  //搜索框
  search: function (e) {
    var s = e.detail.value
    var sa = s.split(' ')
    console.log(sa)
    this.setData({
      retrieval: sa
    })
    this.filter()
  },

  classify:function(e) {
    var that=this
    var id = e.detail.value
    var cls = this.data.clsText[id]
    this.setData({
      cls: cls
    })
    this.filter()
  },

  filter: function() {
    var that=this
    var cls=this.data.cls
    var re=this.data.retrieval
    var g=app.globalData.goods
    for(let i=0; i<g.length; ++i) { // tag为false可见
      var hide = false
      if(cls=="不选择") { //只判断re
        for(let j=0; j<re.length; ++j) {
          if(g[i].name.indexOf(re[j])==-1) {
            hide=true
            break
          }
        }
      } else if(re.length==0) { //只判断cls
        if(g[i].classification!=cls)
          hide=true
      } else { //都要判断
        for (let j = 0; j < re.length; ++j) {
          if (g[i].name.indexOf(re[j]) == -1 || g[i].classification != cls) {
            hide = true
            break
          }
        }
      }
      g[i].tag=hide
    }
    this.setData({
      goods: g
    })
  },

  // 修改商品
  editProduct: function(e) {
    var that = this
    var ele = e.currentTarget.dataset.ele
    var id = ele._id
    var ct = app.globalData.cart
    var ex = false
    console.log(id)
    wx.redirectTo({
      url: '../product-edit/product-edit?id='+id+"&cls="+that.data.cls,
    })
    app.onGetProduct() 
  },

  addProduct: function() {
    wx.redirectTo({
      url: '../product-edit/product-edit',
    })
    app.onGetProduct() 
  },

  goIndex:function() {
    wx.switchTab({
      url: '../index/index',
    })
  },


  updateProduct: function () {
    app.onGetProduct()
    this.setData({
      goods:app.globalData.goods
    })
  }

})
