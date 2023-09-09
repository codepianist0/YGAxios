import YGRequest from "./request";

import { TIME_OUT, BASE_URL } from "./config";

const ygRequest = new YGRequest({
  baseURL: BASE_URL,
  timeout: TIME_OUT,
})

const ygRequest2 = new YGRequest({
  baseURL: "http://codercba.com:1888/airbnb/api",
  timeout: TIME_OUT,
  
  // 2. 添加实例的拦截器
  interceptors: {
    requestSuccessFn(config) {
      console.log("爱彼迎实例的请求拦截");
      return config
    },
    requestFailureFn(err) {
      console.log("请求失败拦截");
    },
    responseSuccessFn(res) {
      console.log("爱彼迎实例响应拦截");
      return res
    },
    responseFailureFn(err) {
      console.log("响应拦截失败");
    },
  }
})

export {
  ygRequest,
  ygRequest2
}