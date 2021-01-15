//index.js
const app = getApp()
const APPKEY = "a255629914cf48529512ea9c2b322d00"

Page({
  data: {
    location: "", // 定位
    city: "", // 市
    district: "", // 区
    dateTime: "", // 当前时间
    updateTime: "", // 最近更新时间
    fxLink: "", // 该城市的天气预报和实况自适应网页，可嵌入网站或应用
    now: "", // 实况
    daily: [] // 未来三天预报
  },

  onLoad: function() {
    this.getLocation();
    var date = new Date();
    this.setData({
      dateTime: (date.getMonth() + 1) + "月" + date.getDate() + "日 星期" + ["一", "二", "三", "四", "五", "六", "日"][date.getDay()]
    })
  },

  getLocation: function() {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: (result) => {
        that.setData({
          location: result.longitude + "," + result.latitude
        })
        that.getWeather()
        that.get3dWeather()
        that.getCityByLoaction()
      },
      fail: (res) => {
        wx.showModal({
          title: '获取定位信息失败',
          content: '为了获取准确的天气预报，请在设置中授权【位置信息】',
          success (res) {
            if (res.confirm) {
              wx.openSetting({
                success: function(data) {
                  if (data.authSetting["scope.userLocation"] === true) {
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 1000
                    })
                    that.getLocation()
                  } else {
                    wx.showToast({
                      title: '授权失败',
                      icon: 'none',
                      duration: 1000
                    })
                    that.setData({
                      location: "116.41,39.92"
                    })
                    that.getWeather()
                    that.get3dWeather()
                    that.getCityByLoaction()
                  }
                },
                fail: function(data) {
                  wx.showToast({
                    title: '唤起设置页失败，请手动打开',
                    icon: 'none',
                    duration: 1000
                  })
                  that.setData({
                    location: "116.41,39.92"
                  })
                  that.getWeather()
                  that.get3dWeather()
                  that.getCityByLoaction()
                }
              })
            } else if (res.cancel) {
              that.setData({
                location: "116.41,39.92"
              })
              that.getWeather()
              that.get3dWeather()
              that.getCityByLoaction()
            }
          }
        })
      },
      complete: (res) => {},
    })
  },
  getWeather: function() {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "getWeatherNow",
      data: {
        key: APPKEY,
        location: that.data.location
      }
    }).then(res => {
      that.setData({
        now: JSON.parse(res.result).now
      })
      wx.hideLoading({
        success: (res) => {},
      })
    }).catch(err => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  getCityByLoaction: function() {
    var that = this;
    wx.cloud.callFunction({
      name: "getCityByLoaction",
      data: {
        key: APPKEY,
        location: this.data.location
      }
    }).then(res => {
      var data = JSON.parse(res.result).location[0];
      this.setData({
        city: data.adm2,
        district: data.name
      })
    }).catch(err => {

    })
  },
  get3dWeather: function() {
    var that = this;
    wx.cloud.callFunction({
      name: "getWeather3d",
      data: {
        key: APPKEY,
        location: that.data.location
      }
    }).then(res => {
      var data = JSON.parse(res.result)
      data.daily.forEach(item => {
        var formatDate = that.formatTime(new Date(item.fxDate));
        item.date = formatDate.date;
        item.week = formatDate.week;
      });
      that.setData({
        daily: data.daily,
        updateTime: data.updateTime,
        fxLink: data.fxLink
      })
    }).catch(err => {

    })
  },
  // 格式时间
  formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    const weekArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
    const isToday = date.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)
    return {
      date: [month, day].map(this.formatNumber).join("-"),
      week: isToday ? "今天" : weekArray[date.getDay()]
    }
  },
  // 补零
  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
})
