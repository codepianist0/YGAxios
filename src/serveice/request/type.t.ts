import type { AxiosRequestConfig, AxiosResponse } from "axios"
// 定义一个可以有interceptors的类型
export interface YGRequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: {
    requestSuccessFn?: (config: AxiosRequestConfig) => AxiosRequestConfig
    requestFailureFn?: (err: any) => any
    responseSuccessFn?: (res: T) => T
    responseFailureFn?: (err: any) => any
  }
}