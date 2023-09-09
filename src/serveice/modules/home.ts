import { ygRequest } from "..";

interface Ihome {
  banner: any[]
  dKeyword: any[]
  keywords: any[]
  recommend: any[]
}

ygRequest.request<Ihome>({
  method: "get",
  url: "/home/multidata"
}).then(res => {
  console.log(res);
})