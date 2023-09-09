import { ygRequest2 } from "..";

ygRequest2.request({
  method: "get",
  url: "/entire/list",
  params: {
    offset: 0,
    size: 20
  }
}).then(res => {
  console.log(res);
})

ygRequest2.request({
  url: "/home/highscore",
  method: "get",
  // 3. 给单个网络请求添加拦截器
  interceptors: {
    requestSuccessFn(config) {
      console.log("单个网络请求的拦截");
      return config
    },
    requestFailureFn(err) {
      return err
    },
    responseSuccessFn(res) {
      console.log("单个网络请求的响应拦截");
      return res
    },
  }
}).then(res => {
  console.log(res);
})