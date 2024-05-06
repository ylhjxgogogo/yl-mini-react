import ReactDom from "./core/ReactDom.js";
import App from "./App.jsx";
import React from "./core/React.js";
ReactDom.createRoot(document.querySelector("#root")).render(<App />);

// ReactDom.createRoot(document.querySelector("#root")).render(/* @__PURE__ */ React.createElement(App, null));
