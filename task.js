const dom = document.querySelector("#root");
const btn = document.createElement("button");
btn.innerText = "click";
dom.append(btn);
btn.addEventListener("click", () => {
  console.log("123");
});
let i = 0;
function task() {
    i++;
    console.log(i)
    if(i===100000){
      return true
    }
    return false
}
function taskLoop(deadline){
  let shouldYield=false;
  let success
  while(!shouldYield){
    success=task();
    if(success) return
    shouldYield=deadline.timeRemaining()<1
  }
  if(!success){
    requestIdleCallback(taskLoop)
  }
  

}
requestIdleCallback(taskLoop)
