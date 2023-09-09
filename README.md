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

## 3. 返回值的类型处理

1. 因为前面封装单个网络请求拦截器的时候，new了一个Promise，promise的返回值的类型是unknown，所以可以在new Promise中添加泛型（AxiosResponse）
2. 返回的数据，我们想直接得到data，在全局的响应拦截中return res.data
3. 蛋柿这样会出现问题，返回的类型不是AxiosResponse了
4. 然后我们可以给YGRequest.request设置一个泛型,泛型的默认值值是any，就是如果传入泛型，默认为any，如果传入，则为传入的类型, promise的泛型直接使用这个T就行
5. 然后就是config.interceptors.responseSuccessFn的返回值类型没有修改过来,就需要去到YGResponseConfig中修改它的类型,同样也是使用泛型,当不传入的时候,默认值是AxiosResponse
