//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    orders: [], //暂时保存所有订单
    detail: [], //暂时保存被选择的订单
    dgoods: [], //暂时保存被选择的订单中的商品
    isDetailHide: true, //是否隐藏被选择的订单的详情
    confirmText: ["确认该订单","取消确认"],
    retrieval: [],
  },

  onLoad: function() {
    wx.setNavigationBarTitle({
      title: '我的订单',
    })
    this.setData({
      openid: app.globalData.openid, //
      isRoot: app.globalData.isRoot, //判断管理员,
    })
    console.log(this.data.openid)
  },

  onShow: function () {
    this.getOrders();
  },

  goLogs:function() {
    wx.switchTab({
      url: '../logs/logs',
    })
  },

  //搜索框
  search: function (e) {
    var s = e.detail.value
    var sa = s.split(' ')
    this.setData({
      retrieval: sa
    })
    this.filter()
  },

  filter: function () {
    var that = this
    var re = this.data.retrieval
    var g = this.data.orders
    for (let i = 0; i < g.length; ++i) { // tag为false可见
      var hide = false
      for (let j = 0; j < re.length; ++j) {
        var r=re[j]
        if(r=='') continue;
        if (g[i]._id.indexOf(r) == -1 && g[i].name.indexOf(r) == -1 && g[i].mobile.indexOf(r) == -1 && g[i].time.indexOf(r) == -1) {
          hide = true
          break
        }
      }
      g[i].tag = hide
    }
    this.setData({
      orders: g
    })
  },

  

  //订单详情 打开/关闭
  showDetail: function (e) {
    var idx = e.currentTarget.dataset.index
    this.setData({
      detail: this.data.orders[idx],
      dgoods: this.data.orders[idx].goods,
      isDetailHide: false
    })
  },
  hideDetail: function () {
    this.getOrders()
    this.setData({
      isDetailHide: true
    })
  },

  getOrders: function () {
    var that = this
    var openid = (this.data.isRoot) ? "" : this.data.openid; //root则获取所有用户订单，否则只有该用户订单
    console.log("获得",openid==""?"所有人":"该用户","订单")
    wx.cloud.callFunction({
      name: 'getOrder',
      data: { openid: openid },
      success(res) {
        that.setData({
          orders: res.result.data.reverse(),
          msg: res.result.data.length==0?"无订单":""
        })
      },
      fail(res) {
        console.log(res)
      }
    })
  },

  deleteDetail: function () {
    var that = this
    var detail = this.data.detail
    if (!that.data.isRoot && detail.payed) {//不是管理员且已付款
      wx.showToast({
        title: '鉴于您已上传付款截图，需要您直接找我们的管理人员取消订单',
        icon: 'none',
        duration: 2500
      })
    } else { 
      if(detail.conf!=2) { //未发货
        wx.showModal({
          title: '亲，要删除该订单吗？',
          success(res) {
            if (res.confirm) {
              wx.cloud.callFunction({
                name: 'deleteOrder',
                data: { id: detail._id},
                success(res) {
                  console.log(res)
                  that.getOrders()
                  wx.showToast({
                    title: '删除成功了哦~',
                    icon: 'success',
                    duration: 1500
                  })
                }
              })
              that.setData({
                isDetailHide: true
              })
            }
          },
        })
      } else {
        wx.showToast({
          title: '已发货不能删除',
          icon: 'none',
          duration: 2000
        })
      }
    }
  },

  confirmOrder:function() {
    var that=this
    var detail=this.data.detail
    var conf=1 - detail.conf
    wx.cloud.callFunction({
      name: 'setOrder',
      data: {
        id: detail._id,
        key: "conf",
        value: conf
      },
      success(res) {
        that.setData({
            ["detail.conf"]: conf
        })
      }
    })
  },
  uploadTrack:function() {
    var that = this
    var folderName = "track"
    var fileName = this.data.detail._id
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        console.log(filePath)
        // 上传图片
        const cloudPath = folderName + "/" + fileName + ".jpg"
        console.log(cloudPath)
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            wx.showToast({
              icon: 'none',
              title: '我们会马上确认哦~到个人事务可以看进展哦',
              duration: 2000,
            })
            wx.cloud.callFunction({
              name: 'setOrder',
              data: {
                id: that.data.detail._id,
                key: "conf",
                value: 2,
              },
              success(res) {
                console.log(res)
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

  uploadPic: function () {
    var that = this
    var folderName = "pay"
    var fileName = this.data.detail._id
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
              duration: 1500,
            })
            that.data.detail.payed=true;
            that.setData({
              detail: that.data.detail
            })
            wx.cloud.callFunction({
              name:'setOrder',
              data:{
                id:that.data.detail._id,
                key: "payed",
                value: true
              },
              success(res) {
                console.log(res)
              }
            })
            wx.showModal({
              title: '搞定了~',
              content: '如需帮助可以找店主嘻嘻',
              confirmText: "知道了",
              success(res) {
                if (res.cancel) return;
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

})
