import React, { useState, useEffect } from "react";
import axios from "axios";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// new imports
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute"; // Fix the import path (remove the extra slash)

// App component
const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [taskDependencies, setTaskDependencies] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  //const isAuthenticated = localStorage.getItem('authToken');
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  



  // Fetch tasks on load
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setIsAuthenticated(true); // Set the state to true if userId exists in localStorage
    }
    console.log(userId);

    if (userId) {
      loadTasks();
    }
  }, [isAuthenticated]);

  const loadTasks = async () => {
    const response = await axios.get("http://localhost:3002/tasks");
    setTasks(response.data);
    console.log(tasks);
  };

  // Handle task form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await axios.post("http://localhost:3002/tasks", {
      title,
      description,
      status,
      due_date: dueDate,
      assigned_to: assignedTo,
    });
    setTitle("");
    setDescription("");
    setStatus("Pending");
    setDueDate("");
    setAssignedTo("");
    const response = await axios.get("http://localhost:3002/tasks");
    setTasks(response.data);
    setIsSubmitting(false);
  };

  // Update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    await axios.patch(`http://localhost:3002/tasks/${taskId}/status`, {
      status: newStatus,
    });
    setTasks((prev) =>
      prev.map((task) =>
        task.task_id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Add dependency to a task
  const addDependency = async (taskId, dependsOnTaskId) => {
    await axios.post(`http://localhost:3002/tasks/${taskId}/dependencies`, {
      dependsOnTaskId,
    });
    const response = await axios.get(`http://localhost:3002/tasks`);
    // if(response.status){
    //   alert("Dependency already exists");
    // }
    setTasks(response.data);
  };

  // Delete task
  const deleteTask = async (taskId) => {
    await axios.delete(`http://localhost:3002/tasks/${taskId}`);
    const response = await axios.get(`http://localhost:3002/tasks`);
    setTasks(response.data);
  };


  //new added - logout
  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("userId");
    setIsAuthenticated(false); // Set authentication state to false
  };
  
  return (
    <Router>
      <Routes>
        {/* Pass setIsAuthenticated to Login component as a prop */}
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              
              <div>
                <h1
                  style={{
                    textAlign: "center",
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    color: "#0a0a0a",
                    margin: "20px 0",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                    fontFamily: "'Poppins', sans-serif",
                    letterSpacing: "1.5px",
                  }}
                >
                  <span
                    style={{
                      color: "#0a0a0a",
                    }}
                  >
                    Employee
                  </span>{" "}
                  Task Management System
                </h1>
                {/* Logout button */}
                {/* <button onClick={handleLogout}>Logout</button> */}
                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 30px',
                        backgroundColor: '#343536',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        position: 'absolute',
                        top: '40px', // Adjust the space from the top
                        right: '80px', // Adjust the space from the right
                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                    }}
                    // onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    // onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                    // onMouseDown={(e) => e.target.style.transform = 'scale(0.98)'}
                    // onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                >
                    Logout
                </button>

                
                

                <TaskForm
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  status={status}
                  setStatus={setStatus}
                  dueDate={dueDate}
                  setDueDate={setDueDate}
                  assignedTo={assignedTo}
                  setAssignedTo={setAssignedTo}
                  handleSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
                <TaskList
                  tasks={tasks}
                  taskDependencies={taskDependencies}
                  setTaskDependencies={setTaskDependencies}
                  updateTaskStatus={updateTaskStatus}
                  addDependency={addDependency}
                  deleteTask={deleteTask}
                />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
