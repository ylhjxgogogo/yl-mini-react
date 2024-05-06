//动态创建文本节点
const createTextNode = (textValue) => {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: textValue,
      children: [],
    },
  };
};

//动态创建元素节点
/**
 *
 * @param {string} type
 * @param {object} props
 * @param {Array} children
 */
//展开运算符会把剩余参数收集成一个数组

const createElement = (type, props, ...children) => {
  // console.log("children", children)
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        if (typeof child === "string" || typeof child === "number") {
          //把它变成文本节点
          return createTextNode(child);
        } else {
          return child;
        }
      }),
    },
  };
};
//重写创建dom的动作
//把虚拟dom变成真正的dom
/**
 *
 * @param {Object 虚拟dom节点} el
 * @param {dom 真实dom父容器} container
 */

/**
 * 初始化任务
 * task={
 *    type,
 *    props,
 *    child,
 *    sibling,
 *    parent,
 *    dom
 * }
 */

// const render = (el, container) => {

// //创建真实dom
// const dom=el.type==='TEXT_ELEMENT'?document.createTextNode(""):document.createElement(el.type);
// //添加props
// const propsArr=Object.keys(el.props);
// propsArr.forEach(key=>{
//     if(key!=="children"){
//         dom[key]=el.props[key];
//     }
// });
// //单独处理children;
// const child=el.props.children;//arr
// child.forEach(childNode=>{
//     render(childNode,dom)
// })
// //添加dom到容器上
// container.append(dom)
// }
let nextTask = null;
let root = null;
let currentRoot = null;
const render = (el, container) => {
  //接收main.js里传入的虚拟dom  App根 组件
  let firstTask = {
    type: null,
    props: {
      children: [el],
    },
    parent: null,
    child: null,
    sibling: null,
    dom: container, //真实的root dom
  };
  root = firstTask;
  nextTask = firstTask;
  requestIdleCallback(taskLoop);
};

const update = () => {
  let newTask = {
    props: currentRoot.props,
    dom: currentRoot.dom,
    alternative: currentRoot,
  };
  root = newTask;
  nextTask = newTask;
  requestIdleCallback(taskLoop);
};
function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, newProps, prevProps) {
  //3.新的参数没得，旧的有 做移除
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in newProps)) {
        dom.removeAttribute(key);
      }
    }
  });

  //1.新的参数有，旧的没得
  //2.新的参数有，旧的有，但值不同
  Object.keys(newProps).forEach((key) => {
    if (key !== "children") {
      if (prevProps[key] !== newProps[key]) {
        if (key.startsWith("on")) {
          //onClick=fn
          const eventType = key.slice(2).toLocaleLowerCase(); //把Click划分出来，再把首字母小写->click;
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, newProps[key]);
        } else {
          dom[key] = newProps[key];
        }
      }
    }
  });
}
function initChildren(task, children) {
  let oldChildTask = task.alternative?.child;
  let prevChildTask = null;
  children.forEach((childVdom, index) => {
    const isSameType = oldChildTask && childVdom.type === oldChildTask.type;

    let childTask;
    if (isSameType) {
      childTask = {
        type: childVdom.type,
        props: childVdom.props,
        parent: task,
        child: null,
        sibling: null,
        dom: oldChildTask.dom,
        alternative: oldChildTask,
        effectTag: "update",
      };
    } else {
      childTask = {
        type: childVdom.type,
        props: childVdom.props,
        parent: task,
        child: null,
        sibling: null,
        dom: null,
        effectTag: "placement",
      };
    }
    if (oldChildTask) {
      oldChildTask = oldChildTask.sibling;
    }
    if (index === 0) {
      task.child = childTask;
    } else {
      prevChildTask.sibling = childTask;
    }
    prevChildTask = childTask;
  });
}
function updateFuncComponent(task) {
  //将children每一个child(Vdom)变成 taskObj;
  const children = [task.type(task.props)];
  initChildren(task, children);
}
function updateHostComponent(task) {
  //不是函数组件时才创建dom
  if (!task.dom) {
    //创建真实dom
    const dom = createDom(task.type);
    //完善task对象
    task.dom = dom;
    //给真实dom添加props属性
    updateProps(dom, task.props, {});
  }
  const children = task.props.children;
  initChildren(task, children);
}

/**
 *渲染成真实dom，将每一个dom进行初始化成task对象，返回下一个要执行的任务
 * @param {taskObj} task
 * @returns taskObj 下一个要处理的任务
 */
function taskOfUnit(task) {
  const isFuncCom = typeof task.type === "function";

  if (isFuncCom) {
    updateFuncComponent(task);
  } else {
    updateHostComponent(task);
  }

  //返回下一个待处理的任务
  if (task.child) {
    return task.child;
  }
  let parent = task;
  while (parent) {
    if (parent.sibling) {
      return parent.sibling;
    } else {
      parent = parent.parent;
    }
  }
}
function taskLoop(deadline) {
  let shouldYeild = false; //是否让步
  while (!shouldYeild && nextTask) {
    nextTask = taskOfUnit(nextTask);
    shouldYeild = deadline.timeRemaining() < 1;
  }
  requestIdleCallback(taskLoop);
  if (!nextTask && root) {
    commitRoot(root);
  }
}
//提交到root
function commitRoot() {
  console.log("commitRoot");
  commitWork(root.child);
  currentRoot = root;
  root = null;
}
//统一提交 挂载dom
function commitWork(task) {
  if (!task) return;
  let taskParent = task.parent;
  while (!taskParent.dom) {
    taskParent = taskParent.parent;
  }
  if (task.effectTag === "update") {
    updateProps(task.dom, task.props, task.alternative.props);
  } else if (task.effectTag === "placement") {
    if (task.dom) {
      taskParent.dom.append(task.dom);
    }
  }
  commitWork(task.child);
  commitWork(task.sibling);
}
const React = {
  render,
  createElement,
  update,
};
export default React;
