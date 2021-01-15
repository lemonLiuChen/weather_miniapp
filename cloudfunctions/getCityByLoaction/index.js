// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

var rp = require("request-promise")

// 云函数入口函数
exports.main = async (event, context) => {
  return rp(`https://geoapi.qweather.com/v2/city/lookup?key=${event.key}&location=${event.location}&gzip=n`).then(res => {
    return res;
  }).catch(err => {
    return err;
  })
}