// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: "lemo-e0eb40"
})

var rp = require("request-promise");

// 云函数入口函数
exports.main = async (event, context) => {
  return rp(`https://devapi.qweather.com/v7/weather/now?key=${event.key}&location=${event.location}&gzip=n`)
  .then(function(res) {
    return res;
  }).catch(function(err) {
    return err;
  })
}