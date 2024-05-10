import React from "../core//React.js";
function TodoItem({ todo, removeTodo, cancelTodo, doneTodo }) {
  return (
    <div className={todo.status}>
      {todo.title}
      <button onClick={() => removeTodo(todo.id)}>删除</button>
      {todo.status === "done" ? (
        <button onClick={() => cancelTodo(todo.id)}>取消</button>
      ) : (
        <button onClick={() => doneTodo(todo.id)}>完成</button>
      )}
    </div>
  );
}
export default TodoItem;
