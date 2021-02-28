// miniprogram/pages/product-edit/product-edit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clsIdx: 0,
    cls: "护肤",
    clsText: ["护肤", "面膜", "彩妆", "零食酒水", "身体", "生活", "套装", "香水"],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    var id=options.id
    //id ="5c9e1b5ef9a96f07c06be871"
    if(id) {
      wx.cloud.database().collection("goods").doc(id).get({
        success(res) {
          console.log(res)
          that.setData({
            id: id,
            name: res.data.name,
            price: res.data.price,
            cls: res.data.classification,
          })
        }
      })
    }
  },

  inputName: function(e) {
    this.setData({
      name: e.detail.value
    })
  },

  inputPrice:function(e) {
    this.setData({
      price: e.detail.value
    })
  },

  classify:function(e) {
    var id = e.detail.value
    var cls = this.data.clsText[id]
    this.setData({
      cls: cls
    })
  },

  submit:function() {
    var id=this.data.id;
    var name=this.data.name;
    var cls=this.data.cls;
    var price=this.data.price;
    if(!name || !cls || !price) 
      return ;
    else {
      console.log(id)
      if(!id) id="";
      wx.cloud.callFunction({
        name: 'setProduct',
        data:{
          id: id,
          name:name,
          price: price,
          classification: cls
        },
        success(res) {
          console.log("修改成功:", res)
          wx.showToast({
            title: '成功',
          })
        },
      })
    }
  },
  
  deleteOne: function() {
    var that=this
    var id = this.data.id;
    if(id) {
      wx.showModal({
        title: '确定删除',
        content: '错误删除后不要按返回，再次按确认即可加回来',
        success(res) {
          if(res.confirm) {
            wx.cloud.callFunction({
              name: 'deleteProduct',
              data: { id: id },
              success(res) {
                console.log("删除成功:", res)
                wx.showToast({
                  title: '成功',
                })
                that.setData({
                  id: ""
                })
              },
            })
          }
        }
      })
      
    }
  },

  goProduct:function() {
    var that=this
    wx.redirectTo({
      url: '../product/product?id=' + (that.data.clsText.indexOf(that.data.cls)+1),
    })
  },

})