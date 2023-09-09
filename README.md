# 11_axios封装

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```
# axios封装实现

## 1. 基本实现

### 目录结构

```shell
service{
	config{  // 用于设置公共的配置
		index.ts
	}
	module{  // 用于发送网络请求
		home.ts
		entire.ts
	}
	request{ // 定义了一个类，用于创建axios实例
		index.ts
	}
	index.ts // 创建实例
}
```

### 1. 创建一个class

```typescript
// in request/index.ts
import axios from "axios"
import type { axiosInstance, AxiosRequestConfig } from "axios"

class YGRequest {
  instance: axiosInstance
  constructor(config: AxiosRequestConfig) {
    this.instance = new axios(config)
  }
  request(config: AxiosRequestConfig) {
    return this.instance.request(config)
  }
  get() {
    
  }
  post() {
    
  }
}
export default YGRequest
```

### 2. 创建实例

```typescript
// in index.ts
import YGRequest from "./request"
import { BASE_URL, TIME_OUT } from "./config"
const ygRequest = new YGRequest({
  baseURL: BASE_URL,
  timeout: TIME_OUT
})

exprot {
  ygRequest
}
```

### 3.发送网络请求

``` typescript
// in module/index.ts
import { ygRequest } from ".."
ygRequest.request({
  methond: "get"
  url: "home/miltidata"
})
```

## 2. 拦截器的添加

### 添加全局拦截器

- 直接在类中添加就可以,比较简单

``` typescript
// in request/index.ts
import axios from "axios"
import type { axiosInstance, AxiosRequestConfig } from "axios"

class YGRequest {
  instance: axiosInstance
  constructor(config: AxiosRequestConfig) {
    this.instance = new axios(config)
    // -------------------添加全局拦截器--------------------
    this.instance.interceptors.request.use(config = >{
      console.log("全局请求拦截")
    	return config
    }, err => err)
    this.instance.interceptors.response.use(res => {
      console.log("全局响应拦截")
    })
  }
  request(config: AxiosRequestConfig) {
    return this.instance.request(config)
  }
  get() {
    
  }
  post() {
    
  }
}
export default YGRequest

```

### 单个实例添加拦截器

1. 给YGRequest的config添加interceptors里面是请求和响应拦截的方法
2. 编写一个config的接口,因为原本的`AxiosRequestConfig`接口没有`interceptors`属性,新的接口继承自`AxiosRequestConfig`
3. 添加拦截器,添加的位置和全局拦截器的位置一样,可以做一个判断,如果有interceptors属性,就给这个实例添加拦截器

```typescript
// in index.ts
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
```

```typescript
// in request/index.ts
import axios from "axios"
import type { axiosInstance, AxiosRequestConfig } from "axios"

interface ygRequestConfig extends AxiosRequestConfig {
  interceptors?: {
    requestSusseccFn?: (config: AxiosRequestConfig) => AxiosRequestConfig
    requestFailureFn?: (err: any) => any
    responseSusseccFn?: (res: AxiosResponse) => AxiosResponse
    responseFailureFn?: (err: any) => any
  }
}

class YGRequest {
  instance: axiosInstance
  constructor(config: ygRequestConfig) {
    this.instance = new axios(config)
    // -------------------添加全局拦截器--------------------
    this.instance.interceptors.request.use(config = >{
      console.log("全局请求拦截")
    	return config
    }, err => err)
    this.instance.interceptors.response.use(res => {
      console.log("全局响应拦截")
    })
		// -------------------添加单个实例的拦截器-------------
		this.instance.interceptors.request.use(
      config.interceports?.requestSuccessFn,
      config.interceports?.requestFailureFn
    )
		this.instance.interceptors.response.use(
      config.interceptors?.responseSuccessFn,
      config.interceptors?.responseFailureFn
    )

  }
  request(config: AxiosRequestConfig) {
    return this.instance.request(config)
  }
  get() {
    
  }
  post() {
    
  }
}
export default YGRequest
```

### 单个网络请求添加拦截器

1. 给发送网络请求的request添加interceptor属性,和单个拦截器一样,需要使用自己编写的YGRequestConfig
2. 重点: 不能直接给实例添加上拦截器,如果和上面一样添加,那么就不是单个网络请求的了,
3. 所以可以不添加拦截器,判断是否有interceptors,如果有,执行拦截器的函数,只要获取到拦截后修改的参数和结果就行

```typescript
// in modules entire.ts
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
})
```

``` typescript
// in request/index.ts
// 修改的位置是request方法
request(config: YGRequestConfig) {
    // 3. 给单个网络请求添加拦截器
    // 不能直接instance添加是因为会添加到实例中,单个网络请求的拦截不需要添加到实例中
    // 只要获取到拦截后修改的参数和结果就行
    if(config.interceptors?.requestSuccessFn) {
      config = config.interceptors.requestSuccessFn(config)
    }
    return new Promise((resolve, reject) => {
      this.instance.request(config).then(res => {
        if(config.interceptors?.responseSuccessFn) {
          res = config.interceptors.responseSuccessFn(res)
        }
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }
```

