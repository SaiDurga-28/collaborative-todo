import React, { useState, useMemo, useCallback, memo, useEffect } from "react";
import { FiSun, FiMoon, FiInbox, FiList, FiCheckSquare } from "react-icons/fi";

import { useAuth } from "./contexts/AuthContext.jsx";
import { useTodos } from "./contexts/TodosContext.jsx";
import { useUI } from "./contexts/UIContext.jsx";
import { useCollaboration } from "./contexts/CollaborationContext.jsx";


const ListSidebar = memo(function ListSidebar({
  lists,
  selectedListId,
  onSelectList,
  onDeleteList,
  onAddList,
}) {
  const [newList, setNewList] = useState("");

  return (
    <aside className="panel sidebar-panel">
      <h2 className="panel-title">Lists</h2>

      <ul className="list-reset">
        {lists.map((list) => {
          const isInbox = list.id === "inbox";
          return (
            <li
              key={list.id}
              className={
                "sidebar-item" +
                (selectedListId === list.id ? " sidebar-item-active" : "")
              }
              onClick={() => onSelectList(list.id)}
            >
              <div
                className="sidebar-item-left"
                style={{ alignItems: "center", display: "flex", gap: 8 }}
              >
                {isInbox ? (
                  <FiInbox
                    size={16}
                    style={{ display: "inline-block", transform: "translateY(0.5px)" }}
                  />
                ) : (
                  <FiList
                    size={16}
                    style={{ display: "inline-block", transform: "translateY(0.5px)" }}
                  />
                )}
                <span>{list.name}</span>
              </div>

              {list.id !== "inbox" && (
                <button
                  className="btn-chip"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList(list.id);
                  }}
                >
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <form
        className="panel-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (newList.trim()) {
            onAddList(newList.trim());
            setNewList("");
          }
        }}
      >
        <input
          className="input"
          placeholder="New list"
          value={newList}
          onChange={(e) => setNewList(e.target.value)}
        />
        <button className="btn btn-full" style={{ marginTop: 8 }}>
          Add list
        </button>
      </form>
    </aside>
  );
});


const TaskSection = memo(function TaskSection({
  currentList,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddTag,
  onRemoveTag,
}) {
  const [newTask, setNewTask] = useState("");
  const [subtaskInputs, setSubtaskInputs] = useState({});

  useEffect(() => {
    if (!currentList) {
      setSubtaskInputs({});
      return;
    }
    const ids = currentList.tasks.map((t) => t.id);
    setSubtaskInputs((prev) => {
      const next = {};
      ids.forEach((id) => {
        next[id] = prev[id] || "";
      });
      return next;
    });
  }, [currentList?.tasks]);

  function handleSubtaskChange(taskId, value) {
    setSubtaskInputs((s) => ({ ...s, [taskId]: value }));
  }

  function handleAddSubtaskLocal(taskId) {
    const val = (subtaskInputs[taskId] || "").trim();
    if (!val) return;
    onAddSubtask(currentList.id, taskId, val);
    setSubtaskInputs((s) => ({ ...s, [taskId]: "" }));
  }

  if (!currentList) return <main className="panel tasks-panel">No list selected</main>;

  return (
    <main className="panel tasks-panel">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FiCheckSquare size={18} style={{ color: "var(--accent)" }} />
        <h2 className="panel-title" style={{ margin: 0, fontSize: "1.15rem" }}>
          {currentList.name}
        </h2>
      </div>

      <div className="task-list" style={{ marginTop: 8 }}>
        {currentList.tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-row">
              <label className="task-main" style={{ gap: 12 }}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(currentList.id, task.id)}
                />
                <span
                  className={"task-title" + (task.completed ? " task-title-done" : "")}
                  style={{ fontSize: "1.05rem" }}
                >
                  {task.title}
                </span>
              </label>

              <button
                className="btn-delete"
                onClick={() => onDeleteTask(currentList.id, task.id)}
              >
                Delete
              </button>
            </div>

            <div className="task-tags-row" style={{ marginTop: 10 }}>
              {task.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    className="btn-chip tag-remove"
                    onClick={() => onRemoveTag(currentList.id, task.id, tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                className="btn-chip tag-add"
                onClick={() => {
                  const t = window.prompt("Tag name?");
                  if (t?.trim()) onAddTag(currentList.id, task.id, t.trim());
                }}
              >
                + Tag
              </button>
            </div>

            <div className="subtasks" style={{ marginTop: 12 }}>
              {task.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="subtask-row"
                  style={{ gap: 12, marginBottom: 6 }}
                >
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => onToggleSubtask(currentList.id, task.id, st.id)}
                  />
                  <span
                    className={
                      "subtask-title" + (st.completed ? " subtask-title-done" : "")
                    }
                    style={{ fontSize: "0.98rem" }}
                  >
                    {st.title}
                  </span>
                  <button
                    className="btn-delete"
                    onClick={() => onDeleteSubtask(currentList.id, task.id, st.id)}
                    style={{ marginLeft: "auto" }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 10, alignItems: "center" }}>
              <input
                className="subtask-input"
                placeholder="Add subtask..."
                value={subtaskInputs[task.id] || ""}
                onChange={(e) => handleSubtaskChange(task.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtaskLocal(task.id);
                  }
                }}
              />
              <button
                className="btn"
                style={{ padding: "8px 10px", fontSize: "0.9rem", minWidth: 68 }}
                onClick={() => handleAddSubtaskLocal(task.id)}
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>

      <form
        className="panel-form panel-form-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (newTask.trim()) {
            onAddTask(currentList.id, newTask.trim());
            setNewTask("");
          }
        }}
        style={{ marginTop: 12 }}
      >
        <input
          className="input"
          placeholder="New task…"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{ fontSize: "1rem" }}
        />
        <button className="btn" style={{ marginLeft: 12, minWidth: 84 }}>
          Add
        </button>
      </form>
    </main>
  );
});


const ActivityPanel = memo(function ActivityPanel({ activityLog }) {
  return (
    <aside className="panel activity-panel">
      <h2 className="panel-title">Activity</h2>
      <ul className="list-reset" style={{ margin: 0, padding: 0 }}>
        {activityLog.map((log) => (
          <li key={log.id} className="activity-item">
            <div className="activity-time">{log.time}</div>
            <div className="activity-text">{log.message}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
});

export default function App() {
  const { user, isAuthenticated, login, logout } = useAuth();
  const {
    lists,
    selectedListId,
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
  } = useTodos();
  const { theme, toggleTheme } = useUI();
  const { activityLog } = useCollaboration();

  const [name, setName] = useState("");

  const currentList = useMemo(
    () => lists.find((l) => l.id === selectedListId) || lists[0] || null,
    [lists, selectedListId]
  );

  const handleSelectList = useCallback((id) => selectList(id), [selectList]);
  const handleDeleteList = useCallback((id) => deleteList(id), [deleteList]);
  const handleAddList = useCallback((title) => addList(title), [addList]);

  const handleAddTask = useCallback((listId, title) => addTask(listId, title), [addTask]);
  const handleToggleTask = useCallback((listId, taskId) => toggleTask(listId, taskId), [toggleTask]);
  const handleDeleteTask = useCallback((listId, taskId) => deleteTask(listId, taskId), [deleteTask]);

  const handleAddSubtask = useCallback((listId, taskId, title) => addSubtask(listId, taskId, title), [addSubtask]);
  const handleToggleSubtask = useCallback((listId, taskId, subId) => toggleSubtask(listId, taskId, subId), [toggleSubtask]);
  const handleDeleteSubtask = useCallback((listId, taskId, subId) => deleteSubtask(listId, taskId, subId), [deleteSubtask]);

  const handleAddTag = useCallback((listId, taskId, tag) => addTag(listId, taskId, tag), [addTag]);
  const handleRemoveTag = useCallback((listId, taskId, tag) => removeTag(listId, taskId, tag), [removeTag]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (name.trim()) login(name.trim());
  };

  const handleLogout = useCallback(() => {
    try {
      logout();
    } finally {
      setName("");
    }
  }, [logout]);

  
  if (!isAuthenticated) {
    return (
      <div className="auth-root">
        <div className="fade-in auth-card panel">
          <div className="auth-left">
            <div className="brand">
              <h1 className="app-title">Collaborative Todo App</h1>
              <p className="app-subtitle">Plan, organize and track tasks with collaborative activity.</p>
            </div>

            <ul className="feature-list">
              <li>✓ Multiple lists and tasks</li>
              <li>✓ Subtasks & tags</li>
              <li>✓ Activity feed & theme toggle</li>
              <li>✓ Responsive UI and theme support</li>
            </ul>

            <p className="feature-desc">
              This mock app logs your actions to the activity feed — use different names to simulate users.
            </p>
          </div>

          <form className="auth-form panel" onSubmit={handleLogin} aria-label="Login form">
            <h2 className="login-title">Log in</h2>
            <p className="login-sub">Start a mock session by entering any name.</p>

            <label className="input-label" htmlFor="nameInput">Name</label>
            <input
              id="nameInput"
              className="input"
              placeholder="Your name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-required="true"
            />

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <button className="btn" type="submit" style={{ flex: 1 }}>
                Continue
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setName(""); }}
                aria-label="Clear"
                style={{ minWidth: 110 }}
              >
                Clear
              </button>
            </div>

            <div className="login-note">Tip: use different names to simulate multiple users.</div>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className="app-root">
      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1 className="app-title">Collaborative Todo App</h1>
            <p className="app-user-greeting">Hi, {user.name}</p>
            <p className="app-subtitle">Lists · Tasks · Subtasks · Tags · Activity · Theme</p>
          </div>

          <div className="app-header-right">
            <button className="btn-circle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>

            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="app-layout">
          <ListSidebar
            lists={lists}
            selectedListId={selectedListId}
            onSelectList={handleSelectList}
            onDeleteList={handleDeleteList}
            onAddList={handleAddList}
          />

          <TaskSection
            currentList={currentList}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          <ActivityPanel activityLog={activityLog} />
        </div>
      </div>
    </div>
  );
}
