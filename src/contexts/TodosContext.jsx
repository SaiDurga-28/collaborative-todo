import { createContext, useContext, useReducer } from "react";
import { useCollaboration } from "./CollaborationContext.jsx";

const TodosContext = createContext(null);

const initialState = {
  lists: [
    {
      id: "inbox",
      name: "Inbox",
      tasks: [
        {
          id: "t1",
          title: "Sample task 1",
          completed: false,
          tags: ["demo"],
          subtasks: [
            { id: "st1", title: "Sample subtask 1", completed: false },
          ],
        },
        {
          id: "t2",
          title: "Sample task 2",
          completed: true,
          tags: ["completed"],
          subtasks: [],
        },
      ],
    },
  ],
  selectedListId: "inbox",
};

function todosReducer(state, action) {
  switch (action.type) {
    case "ADD_LIST": {
      const newList = {
        id: crypto.randomUUID(),
        name: action.name,
        tasks: [],
      };
      return {
        ...state,
        lists: [...state.lists, newList],
        selectedListId: newList.id,
      };
    }

    case "DELETE_LIST": {
      const updatedLists = state.lists.filter((l) => l.id !== action.id);
      const newSelected =
        state.selectedListId === action.id
          ? updatedLists[0]?.id || null
          : state.selectedListId;

      return {
        ...state,
        lists: updatedLists,
        selectedListId: newSelected,
      };
    }

    case "SELECT_LIST":
      return { ...state, selectedListId: action.id };

    case "ADD_TASK": {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                tasks: [
                  ...list.tasks,
                  {
                    id: crypto.randomUUID(),
                    title: action.title,
                    completed: false,
                    tags: [],
                    subtasks: [],
                  },
                ],
              }
            : list
        ),
      };
    }

    case "TOGGLE_TASK": {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === action.taskId
                    ? { ...task, completed: !task.completed }
                    : task
                ),
              }
            : list
        ),
      };
    }

    case "DELETE_TASK": {
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                tasks: list.tasks.filter((t) => t.id !== action.taskId),
              }
            : list
        ),
      };
    }

    // ---------- SUBTASKS ----------
    case "ADD_SUBTASK": {
      const { listId, taskId, title } = action;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: [
                          ...task.subtasks,
                          {
                            id: crypto.randomUUID(),
                            title,
                            completed: false,
                          },
                        ],
                      }
                    : task
                ),
              }
            : list
        ),
      };
    }

    case "TOGGLE_SUBTASK": {
      const { listId, taskId, subtaskId } = action;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.map((st) =>
                          st.id === subtaskId
                            ? { ...st, completed: !st.completed }
                            : st
                        ),
                      }
                    : task
                ),
              }
            : list
        ),
      };
    }

    case "DELETE_SUBTASK": {
      const { listId, taskId, subtaskId } = action;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.filter(
                          (st) => st.id !== subtaskId
                        ),
                      }
                    : task
                ),
              }
            : list
        ),
      };
    }

    // ---------- TAGS ----------
    case "ADD_TAG": {
      const { listId, taskId, tag } = action;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === taskId
                    ? task.tags.includes(tag)
                      ? task
                      : {
                          ...task,
                          tags: [...task.tags, tag],
                        }
                    : task
                ),
              }
            : list
        ),
      };
    }

    case "REMOVE_TAG": {
      const { listId, taskId, tag } = action;
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === taskId
                    ? {
                        ...task,
                        tags: task.tags.filter((t) => t !== tag),
                      }
                    : task
                ),
              }
            : list
        ),
      };
    }

    default:
      return state;
  }
}

export function TodosProvider({ children }) {
  const [state, dispatch] = useReducer(todosReducer, initialState);
  const { addActivity } = useCollaboration();

  const addList = (name) => {
    dispatch({ type: "ADD_LIST", name });
    addActivity(`Created new list "${name}"`);
  };

  const deleteList = (id) => {
    const list = state.lists.find((l) => l.id === id);
    dispatch({ type: "DELETE_LIST", id });
    addActivity(`Deleted list "${list?.name}"`);
  };

  const selectList = (id) => dispatch({ type: "SELECT_LIST", id });

  const addTask = (listId, title) => {
    const list = state.lists.find((l) => l.id === listId);
    dispatch({ type: "ADD_TASK", listId, title });
    addActivity(`Added task "${title}" to list "${list?.name}"`);
  };

  const toggleTask = (listId, taskId) => {
    const list = state.lists.find((l) => l.id === listId);
    const task = list?.tasks.find((t) => t.id === taskId);

    dispatch({ type: "TOGGLE_TASK", listId, taskId });

    if (task) {
      addActivity(
        `${task.title} marked as ${
          task.completed ? "incomplete" : "completed"
        }`
      );
    }
  };

  const deleteTask = (listId, taskId) => {
    const list = state.lists.find((l) => l.id === listId);
    const task = list?.tasks.find((t) => t.id === taskId);

    dispatch({ type: "DELETE_TASK", listId, taskId });
    addActivity(`Deleted task "${task?.title}"`);
  };

  // ---------- SUBTASK actions ----------
  const addSubtask = (listId, taskId, title) => {
    const list = state.lists.find((l) => l.id === listId);
    const task = list?.tasks.find((t) => t.id === taskId);

    dispatch({ type: "ADD_SUBTASK", listId, taskId, title });
    addActivity(
      `Added subtask "${title}" under "${task?.title}" in list "${list?.name}"`
    );
  };

  const toggleSubtask = (listId, taskId, subtaskId) => {
    dispatch({ type: "TOGGLE_SUBTASK", listId, taskId, subtaskId });
    addActivity(`Toggled a subtask`);
  };

  const deleteSubtask = (listId, taskId, subtaskId) => {
    dispatch({ type: "DELETE_SUBTASK", listId, taskId, subtaskId });
    addActivity(`Deleted a subtask`);
  };

  // ---------- TAG actions ----------
  const addTag = (listId, taskId, rawTag) => {
    const tag = rawTag.trim();
    if (!tag) return;

    const list = state.lists.find((l) => l.id === listId);
    const task = list?.tasks.find((t) => t.id === taskId);

    dispatch({ type: "ADD_TAG", listId, taskId, tag });
    addActivity(`Added tag "${tag}" to task "${task?.title}"`);
  };

  const removeTag = (listId, taskId, tag) => {
    const list = state.lists.find((l) => l.id === listId);
    const task = list?.tasks.find((t) => t.id === taskId);

    dispatch({ type: "REMOVE_TAG", listId, taskId, tag });
    addActivity(`Removed tag "${tag}" from task "${task?.title}"`);
  };

  const value = {
    lists: state.lists,
    selectedListId: state.selectedListId,
    addList,
    deleteList,
    selectList,
    addTask,
    toggleTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addTag,
    removeTag,
  };

  return (
    <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
  );
}

export function useTodos() {
  return useContext(TodosContext);
}
