import React from "react";
import "../App.css";

const TaskList = ({
  tasks,
  taskDependencies,
  setTaskDependencies,
  updateTaskStatus,
  addDependency,
  deleteTask,
}) => (

  <div
    style={{
      margin: "20px auto",
      maxWidth: "90%",
      padding: "10px",
      boxSizing: "border-box",
    }}
  >
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        margin: "20px 0",
        fontSize: "16px",
        textAlign: "left",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <thead>
        <tr
          style={{
            backgroundColor: "#131414",
            color: "white",
            textTransform: "uppercase",
            fontWeight: "bold",
          }}
        >
          <th style={{ padding: "12px" }}>Task ID</th>
          <th style={{ padding: "12px" }}>Title</th>
          <th style={{ padding: "12px" }}>Description</th>
          <th style={{ padding: "12px" }}>Status</th>
          <th style={{ padding: "12px" }}>Due Date</th>
          <th style={{ padding: "12px" }}>Assigned To</th>
          <th style={{ padding: "12px" }}>Add Dependency</th>
          <th style={{ padding: "12px" }}>Delete Task</th>
          <th style={{ padding: "12px" }}>Dependencies</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => (
          <tr
            key={task.task_id}
            style={{
              backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
              borderBottom: "1px solid #ddd",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f1f1f1")}
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor =
                index % 2 === 0 ? "#f9f9f9" : "#ffffff")
            }
          >
            <td style={{ padding: "12px" }}>{task.task_id}</td>
            <td style={{ padding: "12px" }}>{task.title}</td>
            <td style={{ padding: "12px" }}>{task.description}</td>
            <td style={{ padding: "12px" }}>
              <select
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                value={task.status}
                onChange={(e) => updateTaskStatus(task.task_id, e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </td>
            <td style={{ padding: "12px" }}>{task.due_date}</td>
            <td style={{ padding: "12px" }}>{task.assigned_to}</td>
            <td style={{ padding: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Enter Task ID"
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                  value={taskDependencies[task.task_id] || ""}
                  onChange={(e) =>
                    setTaskDependencies((prev) => ({
                      ...prev,
                      [task.task_id]: e.target.value,
                    }))
                  }
                />
                <button
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const dependsOnTaskId = taskDependencies[task.task_id];
                    if (dependsOnTaskId) {
                      addDependency(task.task_id, dependsOnTaskId);
                    } else {
                      alert("Please enter a Dependency Task ID!");
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </td>
            <td style={{ padding: "12px" }}>
              <button
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
                onClick={() => deleteTask(task.task_id)}
              >
                Delete
              </button>
            </td>
            <td style={{ padding: "12px" }}>
              {task.dependencies?.length > 0 ? (
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {task.dependencies.map((dep) => (
                    <li key={dep.taskId} style={{ fontSize: "16px" }}>
                      Depends on: {dep.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "16px", margin: 0 }}>No dependencies</p>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TaskList;
