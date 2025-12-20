import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
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
      const lists = state.lists.filter((l) => l.id !== action.id);

      const newSelected =
        state.selectedListId === action.id
          ? lists[0]?.id || null
          : state.selectedListId;

      return {
        ...state,
        lists,
        selectedListId: newSelected,
      };
    }

    case "SELECT_LIST":
      return { ...state, selectedListId: action.id };

    case "ADD_TASK":
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

    case "TOGGLE_TASK":
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

    case "DELETE_TASK":
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

    case "ADD_SUBTASK":
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === action.taskId
                    ? {
                        ...task,
                        subtasks: [
                          ...task.subtasks,
                          {
                            id: crypto.randomUUID(),
                            title: action.title,
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

    case "TOGGLE_SUBTASK":
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === action.taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.map((st) =>
                          st.id === action.subtaskId
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

    case "DELETE_SUBTASK":
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === action.taskId
                    ? {
                        ...task,
                        subtasks: task.subtasks.filter(
                          (st) => st.id !== action.subtaskId
                        ),
                      }
                    : task
                ),
              }
            : list
        ),
      };

    case "ADD_TAG":
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === action.taskId &&
                  !task.tags.includes(action.tag)
                    ? { ...task, tags: [...task.tags, action.tag] }
                    : task
                ),
              }
            : list
        ),
      };

    case "REMOVE_TAG":
      return {
        ...state,
        lists: state.lists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === action.taskId
                    ? {
                        ...task,
                        tags: task.tags.filter((t) => t !== action.tag),
                      }
                    : task
                ),
              }
            : list
        ),
      };

    default:
      return state;
  }
}

export function TodosProvider({ children }) {
  const [state, dispatch] = useReducer(todosReducer, initialState);
  const { addActivity } = useCollaboration();

  const addList = useCallback((name) => {
    dispatch({ type: "ADD_LIST", name });
    addActivity(`Created list "${name}"`);
  }, [addActivity]);

  const deleteList = useCallback((id) => {
    dispatch({ type: "DELETE_LIST", id });
    addActivity(`Deleted a list`);
  }, [addActivity]);

  const selectList = useCallback((id) => {
    dispatch({ type: "SELECT_LIST", id });
  }, []);

  const addTask = useCallback((listId, title) => {
    dispatch({ type: "ADD_TASK", listId, title });
    addActivity(`Added task "${title}"`);
  }, [addActivity]);

  const toggleTask = useCallback((listId, taskId) => {
    dispatch({ type: "TOGGLE_TASK", listId, taskId });
    addActivity(`Toggled task status`);
  }, [addActivity]);

  const deleteTask = useCallback((listId, taskId) => {
    dispatch({ type: "DELETE_TASK", listId, taskId });
    addActivity(`Deleted task`);
  }, [addActivity]);

  const addSubtask = useCallback((listId, taskId, title) => {
    dispatch({ type: "ADD_SUBTASK", listId, taskId, title });
    addActivity(`Added subtask "${title}"`);
  }, [addActivity]);

  const toggleSubtask = useCallback((listId, taskId, subtaskId) => {
    dispatch({ type: "TOGGLE_SUBTASK", listId, taskId, subtaskId });
    addActivity(`Toggled subtask`);
  }, [addActivity]);

  const deleteSubtask = useCallback((listId, taskId, subtaskId) => {
    dispatch({ type: "DELETE_SUBTASK", listId, taskId, subtaskId });
    addActivity(`Deleted subtask`);
  }, [addActivity]);

  const addTag = useCallback((listId, taskId, tag) => {
    dispatch({ type: "ADD_TAG", listId, taskId, tag });
    addActivity(`Added tag "${tag}"`);
  }, [addActivity]);

  const removeTag = useCallback((listId, taskId, tag) => {
    dispatch({ type: "REMOVE_TAG", listId, taskId, tag });
    addActivity(`Removed tag "${tag}"`);
  }, [addActivity]);

  const value = useMemo(
    () => ({
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
    }),
    [state, addList, deleteList, selectList, addTask, toggleTask, deleteTask, addSubtask, toggleSubtask, deleteSubtask, addTag, removeTag]
  );

  return (
    <TodosContext.Provider value={value}>
      {children}
    </TodosContext.Provider>
  );
}

export function useTodos() {
  return useContext(TodosContext);
}
