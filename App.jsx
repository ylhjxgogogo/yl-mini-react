/**@jsx YReact.createElement */
//告诉vite使上面定义的编译
import YReact from "./core/React";
import React from "./core/React";
import Todo from "./components/Todo";
const App = () => {
  return (
    <div id="app">
      <Todo />
    </div>
  );
};
//参数对应 type 、属性、children

//React.createElement("div", null, "hahha");

export default App;
