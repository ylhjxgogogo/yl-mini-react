//利用类实现发布订阅
export class MyEvent {
  constructor() {
    this.eventFnList = new Map();
  }
  //实现订阅功能
  tap(event, fn) {
    if (!this.eventFnList.has(event)) {
      //把事件和对应的事件处理函数添加进去
      const fnList = [fn];
      this.eventFnList.set(event, fnList);
    } else {
      this.eventFnList.get(event).push(fn);
    }
  }
  //实现发布功能,传入发布的事件，和该回调需要的参数
  call(event, ...arg) {
    const fnList = this.eventFnList.get(event);
    fnList.forEach((fn) => {
      fn(...arg);
    });
  }
}
//通过继承来使用到父类的发布订阅功能
class Dom extends MyEvent {
  constructor() {
    super();
  }
}
let dom = new Dom();
dom.tap("click", () => {
  console.log("click1");
});
dom.tap("click", (e) => {
  console.log("click2", e);
});
dom.call("click", "hah");
