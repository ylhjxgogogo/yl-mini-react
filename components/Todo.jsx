import React from "../core/React";
import "../style/todo.css";
import TodoItem from "./TodoItem";
function Todo() {
  const [value, setValue] = React.useState("");
  const [todoList, setTodoList] = React.useState([]);
  const [filter, setFilter] = React.useState("all");
  const [diplayTodo, setDiplayTodo] = React.useState([]);
  const handleInput = (e) => {
    // console.log(e.target.value);
    setValue(e.target.value);
  };
  const handleKeyUp = (e) => {
    let keyCode = e.keyCode;
    if (keyCode === 13) {
      setTodoList([
        ...todoList,
        { title: value, id: crypto.randomUUID(), status: "active" },
      ]);
      setValue("");
    }
  };
  const handleAdd = () => {
    addTodo(value);
    setValue("");
  };

  const createTodo = (title) => {
    return { title, id: crypto.randomUUID(), status: "active" };
  };
  const addTodo = (title) => {
    setTodoList([...todoList, createTodo(title)]);
  };
  const removeTodo = (id) => {
    const newTodos = todoList.filter((todo) => {
      return id !== todo.id;
    });
    setTodoList(newTodos);
  };
  const doneTodo = (id) => {
    const newTodos = todoList.map((todo) => {
      if (id === todo.id) {
        return {
          ...todo,
          status: "done",
        };
      }
      return todo;
    });
    setTodoList(newTodos);
  };
  const cancelTodo = (id) => {
    const newTodos = todoList.map((todo) => {
      if (id === todo.id) {
        return {
          ...todo,
          status: "active",
        };
      }
      return todo;
    });
    setTodoList(newTodos);
  };
  const handleSave = () => {
    localStorage.setItem("todoList", JSON.stringify(todoList));
  };

  React.useEffect(() => {
    const localTodos = localStorage.getItem("todoList");
    if (localTodos) {
      setTodoList(JSON.parse(localTodos));
    }
  }, []);
  React.useEffect(() => {
    let filterList;
    if (filter === "active") {
      filterList = todoList.filter((todo) => {
        return todo.status === "active";
      });
      setDiplayTodo(filterList);
    } else if (filter === "done") {
      filterList = todoList.filter((todo) => {
        return todo.status === "done";
      });
      setDiplayTodo(filterList);
    } else {
      setDiplayTodo(todoList);
    }
  }, [filter, todoList]);
  return (
    <div>
      <h1>Todo</h1>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInput(e)}
        onKeyUp={handleKeyUp}
      />
      <button onClick={handleAdd}>add</button>
      <button onClick={handleSave}>save</button>
      <div>
        <label htmlFor="all">
          <input
            type="radio"
            name="filter"
            id="all"
            checked={filter === "all"}
            onChange={() => setFilter("all")}
          />
          all
        </label>
        <label htmlFor="active">
          <input
            type="radio"
            name="filter"
            id="active"
            checked={filter === "active"}
            onChange={() => setFilter("active")}
          />
          active
        </label>
        <label htmlFor="done">
          <input
            type="radio"
            name="filter"
            id="done"
            checked={filter === "done"}
            onChange={() => setFilter("done")}
          />
          done
        </label>
      </div>
      <ul>
        {...diplayTodo.map((todo, index) => {
          return (
            <li key={index}>
              <TodoItem
                todo={todo}
                removeTodo={removeTodo}
                doneTodo={doneTodo}
                cancelTodo={cancelTodo}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default Todo;
