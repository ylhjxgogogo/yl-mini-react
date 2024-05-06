/**@jsx YReact.createElement */
//告诉vite使用上面定义的编译
import YReact from "../core/React";
import React from "../core/React";
// function App() {
//   return <div id="app">hi-mini-react</div>;
// }
let num = 0;
const Counter = () => {
  const handleClick = () => {
    console.log("click");
    num++;
    React.update();
  };
  return (
    <div>
      count:{num}
      <button onClick={handleClick}>点击</button>
    </div>
  );
};

const ContainerCounter = () => {
  return <Counter />;
};
const App = () => {
  return (
    <div id="app">
      <p>姓名：余露</p>
      <span>年龄:18</span>
      <Counter />
    </div>
  );
};

//React.createElement("div", null, "hahha");

export default App;
