// miniprogram/pages/detail/detail.js
const app=getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    prevpageText: ['','返回小宝匣','看选中产品',''],
    nextpageText: ['','填写信息','生成订单','查看我的事务'],
    paypic: [],
    curpic: 0,
    curper: 0,
    payed: false,
  },
  onLoad: function (options) {
    this.setData({
      page:1
    })
    this.setData({
      name: wx.getStorageSync('_NAME'),
      mobile: wx.getStorageSync('_MOBILE'),
      address: wx.getStorageSync('_ADDRESS'),
    })
    this.onGetCart()
  },

  onGetCart: function() {
    this.setData({
      cart: app.globalData.cart
    })
    this.getPrice()
  },

  getPrice: function () {
    var tot = 0
    const ct = app.globalData.cart
    for (let i = 0; i < ct.length; ++i) {
      if (ct[i].selected)
        tot += ct[i].num * ct[i].price
    }
    this.setData({
      totalPrice: tot,
    })
  },

  /* 顶部功能按钮 */
  prevpage:function() {
    var page=this.data.page
    if(page==1) {
      wx.switchTab({
        url: '../shoppingcart/shoppingcart',
      })
    } else {
      this.setData({
        page: page-1
      })
    }
  },
  nextpage: function() {
    var page = this.data.page
    if (page == 3) {
      wx.switchTab({
        url: '../logs/logs',
      })
    } else {
      this.setData({
        page: page + 1
      })
    }
  },

  //输入信息
  inputName: function (e) {
    this.setData({
      name: e.detail.value
    })
    wx.setStorageSync('_NAME', e.detail.value)
    //console.log("inputName:", e.detail.value)
  },
  inputMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
    wx.setStorageSync('_MOBILE', e.detail.value)
    //console.log("inputMobile =", e.detail.value)
  },
  inputAddress: function (e) {
    this.setData({
      address: e.detail.value
    })
    wx.setStorageSync('_ADDRESS', e.detail.value)
    //console.log("inputAddress =", e.detail.value)
  },
  submitDetails: function() {
    var that = this
    var name = this.data.name
    var mobile = this.data.mobile;
    var address = this.data.address;
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if(!name || name.length<2) {
      wx.showToast({
        title: '我觉得这名字不行',
        icon: 'none',
        duration: 1500
      })
      return;
    }

    if (mobile.length != 11 || !myreg.test(mobile)) {
      wx.showToast({
        title: '我觉得这手机号不行',
        icon: 'none',
        duration: 1500
      })
      return;
    }

    if (address.length < 10) {
      wx.showToast({
        title: '这地址短的有点过分了，详细点呗',
        icon: 'none',
        duration: 1500
      })
      return;
    }
    wx.showModal({
      title: '终于要确认订单了吗',
      content: '总价:' + that.data.totalPrice,
      confirmText: '干！',
      cancelText: '再想想',
      success(res) {
        if (res.confirm) {
          that.createOrder()
          wx.showToast({
            title: '成功提交订单',
            icon: 'success',
            duration: 1500
          })
          that.setData({
            pageShow: 3
          })
          console.log("Test:  submitDetails =", mobile, "+", address)
        } else if (res.cancel) {
          return;
        }
      }
    })
  },

  //生成订单
  createOrder: function (ct) {
    var that = this
    var ct=app.globalData.cart
    var nc = []
    var tot = this.data.totalPrice;
    var time = util.formatTime(new Date());
    var j=0;
    for (let i = 0; i < ct.length; ++i) {
      if(ct[i].selected) {
        nc.push({})
        nc[j].gid = ct[i]._id;
        nc[j].name = ct[i].name;
        nc[j].price = ct[i].price;
        nc[j].num = ct[i].num;
        j+=1;
      }
    }
    const db = wx.cloud.database().collection("orders")
    db.add({
      data: {
        goods: nc,
        total: tot,
        time: time,
        name: that.data.name,
        mobile: that.data.mobile,
        address: that.data.address,
        payed: false,
        conf: 0,
        tracknum: "NULL"
      },
      success(res) {
        console.log(res)
        that.setData({
          curOrder: res._id,
          page:3
        })
      },
      fail(res) {
        console.log(res)
      }
    })
  },

  changePay: function () {
    var m = this.data.curper
    var p = this.data.curpic
    var l = this.data.paypic[m].length
    this.setData({
      curpic: (p + 1) % l
    })
  },
  changePerson: function () {
    var m = this.data.curper
    this.setData({
      curper: (m + 1) % 2
    })
  },

  uploadPic: function () {
    var that = this
    var folderName = "pay"
    var fileName = this.data.curOrder
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0]
        const cloudPath = folderName + "/" + fileName + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            wx.showToast({
              icon: 'none',
              title: '上传成功了~我们会马上确认哦~可以到个人事务可以看进展哦',
              duration: 2500,
            })
            that.setData({
              payed:true
            })
            wx.cloud.database().collection("orders").doc(that.data.curOrder).update({
              data: {
                payed: true
              }
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
        })
      },
      fail: e => {
        console.log(e)
      },
    })
  },

  done: function() {
    var c=app.globalData.cart
    for (let i = 0; i < c.length; ++i) {
      if (c[i].selected) {
        c.splice(i, 1)
        i -= 1
      }
    }
    wx.showModal({
      title: '复制订单号去找店主咯~',
      content: '我的事务可查看订单',
      confirmText: "我已复制",
      cancelText: "忘了复制",
      success(res) {
        if (res.confirm) {
          wx.switchTab({
            url: '../logs/logs',
          })
        }
      }
    })
  }
})