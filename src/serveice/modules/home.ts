import { ygRequest } from "..";



ygRequest.request({
  method: "get",
  url: "/home/multidata"
}).then(res => {
  console.log(res);
})