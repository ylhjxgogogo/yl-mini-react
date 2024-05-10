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
  // console.log("children", children);
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
let wipRoot = null;
let currentwipRoot = null;
let deletions = []; //保存更新渲染时，因节点类型不同要保存的删除的节点 （div->p） 则保留div删除节点
let wipFiber = null;

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, newProps, oldProps) {
  //新旧props对比有三种情况
  //1.旧的有，而新的没有
  Object.keys(oldProps).forEach((oldkey) => {
    if (oldkey !== "children") {
      if (!(oldkey in newProps)) {
        //新的props里面没有这个oldkey，则把dom上的key删除
        dom.removeAttribute(oldkey);
      }
    }
  });
  //2.旧的有，新的也有，但是值改变了; 3.旧的没有，新的有，说明是新增属性
  Object.keys(newProps).forEach((key) => {
    if (key !== "children") {
      if (oldProps[key] !== newProps[key]) {
        //进行新增或修改值
        if (key.startsWith("on")) {
          //判断是新增事件还是普通属性
          //onClick=fn
          const eventType = key.slice(2).toLocaleLowerCase(); //把Click划分出来，再把首字母小写->click;
          dom.removeEventListener(eventType, oldProps[key]);
          dom.addEventListener(eventType, newProps[key]);
        } else {
          dom[key] = newProps[key];
        }
      }
    }
  });
}
/**
 * 改为与React同名的函数 reconcileChildren
 * 承担将vdom渲染成真实dom
 * 还能区分是更新渲染还是首次渲染
 * @param {taskObj} task
 * @param {arr} children
 */
function reconcileChildren(task, children) {
  //这个函数既要处理首次渲染又要处理更新渲染，区别在于传进来的task是否有alternative标识

  //oldTask存在则表示首次渲染dom树已经存在，现在把每一个childVom变成taskObj是判断一下是新建dom，还是只有某些props改变
  let oldTask = task.alternative?.child; //第一个孩子
  let prevChildTask = null;
  children.forEach((childVdom, index) => {
    let childTask;
    const isSameType = oldTask && oldTask.type === childVdom.type;
    if (isSameType) {
      //类型都是一样的说明只有props发生了改变，dom节点不要再次创建
      childTask = {
        type: childVdom.type,
        props: childVdom.props,
        parent: task,
        child: null,
        sibling: null,
        dom: oldTask.dom,
        alternative: oldTask,
        tag: "update",
      };
    } else {
      //不管是不存在oldtask(首次渲染) 还是存在oldtask只是类型不一致都需要创建dom
      if (childVdom) {
        //排除{showBar && bar} 通过createElement编译成fasle，不能创建dom
        childTask = {
          type: childVdom.type,
          props: childVdom.props,
          parent: task,
          child: null,
          sibling: null,
          dom: null,
          tag: "placement",
        };
      }
      if (oldTask) {
        //只是类型不一致 ，则需要把之前的删除
        console.log("要删除的节点", oldTask);
        deletions.push(oldTask);
      }
    }
    if (oldTask) {
      oldTask = oldTask.sibling;
    }
    if (index === 0) {
      task.child = childTask;
    } else {
      prevChildTask.sibling = childTask;
    }
    if (childTask) {
      prevChildTask = childTask;
    }
  });
  // console.log("oldtask---", oldTask);
  //如果新dom树遍历完了，old dom还存在dom,则说明应该废弃该dom
  while (oldTask) {
    deletions.push(oldTask);
    oldTask = oldTask.sibling;
  }
}
function updateFuncComponent(task) {
  stateHooks = []; //useState
  effectHooks = []; //useEffect
  stateHookIndex = 0;
  wipFiber = task; //拿到当前触发更新的组件
  //将children每一个child(Vdom)变成 taskObj;
  const children = [task.type(task.props)];
  reconcileChildren(task, children);
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
  reconcileChildren(task, children);
}
//render是首次渲染
const render = (el, container) => {
  //接收main.js里传入的虚拟dom  App根 组件
  //从根节点开始创建fiber树
  let firstTask = {
    type: null,
    props: {
      children: [el], //el->App
    },
    parent: null,
    child: null,
    sibling: null,
    dom: container, //真实的root
  };
  wipRoot = firstTask;
  nextTask = firstTask;
  requestIdleCallback(taskLoop);
};
//非首次渲染，就要使用新旧两颗dom树进行比较进行更新dom节点
//currentwipRoot是首次渲染dom树的根节点

//构造一棵新的dom树，从根节点开始进行一一比较
// const update = () => {
//   let newTask = {
//     type: null,
//     props: currentwipRoot.props,
//     parent: null,
//     child: null,
//     sibling: null,
//     dom: currentwipRoot.dom, //真实的wipRoot dom
//     alternative: currentwipRoot, //指向旧节点 这个属性标识是更新渲染，而非首次渲染
//   };
//   wipRoot = newTask;
//   nextTask = newTask;
//   requestIdleCallback(taskLoop); //进入到任务循环，开始构建dom树
// };

//优化更新：找到开始更新的节点，和结束更新的节点
//开始更新节点：触发更新的函数组件
//结束更新：当开始处理  触发更新组件的兄弟节点时，我们认为整棵树更新完了
const updateOptimi = () => {
  const curFnTask = wipFiber;
  //使用闭包，保存当前触发更新的组件，对这个组件树进行更新
  return () => {
    console.log("触发更新的函数组件---", curFnTask);
    //开始点
    let newTask = {
      ...curFnTask,
      alternative: curFnTask,
    };
    wipRoot = newTask; //保存新子树的 根节点
    nextTask = newTask; //进行子树的fiber架构，进行dom更新
    requestIdleCallback(taskLoop); //进入到任务循环，开始构建dom树
  };
};

//定义一个状态数组，维护各自的状态
let stateHooks; //去函数组件初始化，只有函数组件才有Hook;
let stateHookIndex;
//使用钩子函数 setState
const useState = (initial) => {
  let curFnTask = wipFiber; //局部更新
  const oldHook = curFnTask.alternative?.stateHooks[stateHookIndex];
  const stateHook = {
    state: oldHook ? oldHook.state : initial,
    queue: oldHook ? oldHook.queue : [],
  };
  //初始化时为空
  stateHook.queue.forEach((action) => {
    stateHook.state = action(stateHook.state);
  });
  stateHook.queue = [];
  stateHookIndex++;
  stateHooks.push(stateHook);
  curFnTask.stateHooks = stateHooks;
  const setState = (action) => {
    // stateHook.state = actionFn(stateHook.state);
    const eagerState =
      typeof action === "function" ? action(stateHook.state) : action;
    if (eagerState === stateHook.state) return; //如果两次值一样则不更新
    stateHook.queue.push(typeof action === "function" ? action : () => action); //存起来，某个时机统一处理
    //执行更新操作；
    let newTask = {
      ...curFnTask,
      alternative: curFnTask,
    };
    wipRoot = newTask; //保存新子树的 根节点
    nextTask = newTask; //进行子树的fiber架构，进行dom更新
    requestIdleCallback(taskLoop); //进入到任务循环，开始构建dom树
  };
  return [stateHook.state, setState];
};

//创建useEffect hook
//把useEffectHook收集起来，在调用函数组件时进行一个初始化
let effectHooks;
function useEffect(callback, deps) {
  const effectHook = {
    callback,
    deps,
    cleanup: undefined,
  };
  //给当前在工作中的fiber节点绑定effectHook
  // console.log("wipFiber", wipFiber);
  effectHooks.push(effectHook); //把hook收集起来

  wipFiber.effectHooks = effectHooks; //存到当前工作中的fiber节点
}
/**
 *渲染成真实dom，将每一个dom进行初始化成task对象，返回下一个要执行的任务
 * @param {taskObj} fiber
 * @returns taskObj 下一个要处理的任务
 */
function taskOfUnit(fiber) {
  const isFuncCom = typeof fiber.type === "function";

  if (isFuncCom) {
    updateFuncComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  //返回下一个待处理的任务
  if (fiber.child) {
    return fiber.child;
  }
  let parent = fiber;
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
    //判断是否到当前更新组件的兄弟节点了，到了说明当前的dom树更新完了，停止更新
    if (wipRoot?.sibling?.type === nextTask?.type) {
      //更新完成了
      nextTask = undefined;
      // console.log("hit", wipRoot, nextTask);
    }

    shouldYeild = deadline.timeRemaining() < 1;
  }
  if (!nextTask && wipRoot) {
    commitwipRoot(wipRoot);
  }
  //判断nexttask还有没值，有的话继续执行
  if (nextTask && !wipRoot) {
    wipRoot = currentwipRoot;
  }
  requestIdleCallback(taskLoop);
}
//提交到wipRoot
function commitwipRoot() {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  commitEffectHook(); //触发useEffect，在dom树构建完成后，浏览器绘制之前触发
  currentwipRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}
//触发useEffect
function commitEffectHook() {
  function run(fiber) {
    if (!fiber) return;
    if (!fiber.alternative) {
      //说明是首次渲染，useeffect一定会执行
      fiber.effectHooks?.forEach((hook) => {
        hook.cleanup = hook.callback();
        // hook.callback();
      });
    } else {
      //update渲染
      //看看deps 有没有改变
      fiber.effectHooks?.forEach((newhook, index) => {
        if (newhook.deps === undefined) {
          //没有传依赖项，每次都要执行
          newhook.callback();
        }
        if (newhook.deps?.length > 0) {
          const oldEffectHook = fiber.alternative?.effectHooks[index];
          //找到需要更新的依赖
          //some方法表示只要有一个依赖项发生改变，useEffect都要执行
          const needUpdate = oldEffectHook.deps.some((oldDep, i) => {
            return oldDep !== newhook.deps[i];
          });
          if (needUpdate) {
            newhook.cleanup = newhook.callback();
          }
        }
      });
    }

    run(fiber.child);
    run(fiber.sibling);
  }
  function runCleanup(fiber) {
    if (!fiber) return;
    fiber.alternative?.effectHooks?.forEach((hook) => {
      if (hook.deps?.length > 0) {
        hook.cleanup && hook.cleanup();
      }
    });
    runCleanup(fiber.child);
    runCleanup(fiber.sibling);
  }
  runCleanup(wipRoot);
  run(wipRoot);
}
//统一提交 挂载dom
function commitWork(task) {
  if (!task) return;
  let taskParent = task.parent;
  while (!taskParent.dom) {
    taskParent = taskParent.parent;
  }
  if (task.tag === "update" && task.dom) {
    //更新props 把新的props，和旧的props传进去
    updateProps(task.dom, task.props, task.alternative?.props);
  } else if (task.tag === "placement") {
    // console.log("placement");
    if (task.dom) {
      taskParent.dom.append(task.dom);
    }
  }

  commitWork(task.child);
  commitWork(task.sibling);
}
//更新渲染时删除原始节点
//保证parent.dom!==null oldtask.dom！==null
function commitDeletion(oldtask) {
  if (oldtask.dom) {
    //当函数组件执行删除时，由于它child的parent是函数组件本身，所有没有dom，要寻找dom不为空的进行删除
    let parent = oldtask.parent;
    while (!parent.dom) {
      parent = parent.parent;
    } //找到dom不为空时的父级
    parent.dom.removeChild(oldtask.dom);
  } else {
    commitDeletion(oldtask.child); //是函数组件。函数组件dom为null，所有应该删除它的child （返回值）
  }
}
const React = {
  render,
  createElement,
  updateOptimi,
  useState,
  useEffect,
};
export default React;
