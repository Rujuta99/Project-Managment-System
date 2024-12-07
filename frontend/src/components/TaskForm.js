import React from "react";
import "../App.css";

const TaskForm = ({
  title,
  setTitle,
  description,
  setDescription,
  status,
  setStatus,
  dueDate,
  setDueDate,
  assignedTo,
  setAssignedTo,
  handleSubmit,
  isSubmitting,
}) => (
  <form onSubmit={handleSubmit} className="task-form">
    <div className="form-group">
      <label htmlFor="title">Task Title</label>
      <input
        id="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task Title"
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="description">Task Description</label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task Description"
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="dueDate">Due Date</label>
      <input
        id="dueDate"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="assignedTo">Assigned To (Employee ID)</label>
      <input
        id="assignedTo"
        type="text"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        placeholder="Employee ID"
        required
      />
    </div>
    <div className="form-group">
      <label htmlFor="status">Status</label>
      <select
        id="status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
    </div>
    <button type="submit" className="submit-btn" disabled={isSubmitting}>
      {isSubmitting ? "Adding Task..." : "Add Task"}
    </button>
  </form>
);

export default TaskForm;
