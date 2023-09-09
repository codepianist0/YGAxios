import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { YGRequestConfig } from "./type.t";


// 定义一个类 ,用于生成axios实例
class YGRequest {
  instance: AxiosInstance
  constructor(config: YGRequestConfig) {
    this.instance = axios.create(config)

    // 1. 添加全局的拦截器
    this.instance.interceptors.request.use((config) => {
      console.log("全局请求拦截");
      return config
    },(err) => {
      console.log(err);
    })
    this.instance.interceptors.response.use((res) => {
      console.log("全局响应拦截");
      return res.data
    },(err) =>{ 
      console.log(err);
    })

    // 2. 添加单个instance的拦截器
    this.instance.interceptors.request.use(
      config.interceptors?.requestSuccessFn,
      config.interceptors?.requestFailureFn
    )
    this.instance.interceptors.response.use(
      config.interceptors?.responseSuccessFn,
      config.interceptors?.responseFailureFn
    )

  }
  request<T = any>(config: YGRequestConfig<T>) {
    // 3. 给单个网络请求添加拦截器
    // 不能直接instance添加是因为会添加到实例中,单个网络请求的拦截不需要添加到实例中
    // 只要获取到拦截后修改的参数和结果就行
    if(config.interceptors?.requestSuccessFn) {
      config = config.interceptors.requestSuccessFn(config)
    }
    // 4. 细节promise的使用了泛型,默认返回的类型是unknow类型
    return new Promise<T>((resolve, reject) => {
      this.instance.request<any, T>(config).then(res => {
        if(config.interceptors?.responseSuccessFn) {
          res = config.interceptors.responseSuccessFn(res)
        }
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
  get() {

  }
  post() {

  }

}

export default YGRequest