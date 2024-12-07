const express = require("express");
const cors = require("cors");
const { connection } = require("./config");
// Import the specific connection
const neo4j = require("neo4j-driver");

const app = express();
const port = 3002;

// Neo4j configuration
const uri = process.env.NEO4J_URI; // Local Neo4j URI
const user = process.env.NEO4J_USER; // Default username
const password = process.env.NEO4J_PASSWORD; // Your Neo4j password
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// Utility to create Neo4j sessions
const getSession = () => driver.session();

// Middleware for parsing JSON and handling CORS
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type"], // Allowed headers
  })
);

// Explicitly handle preflight requests
app.options("*", cors());

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.path}`);
  next();
});

// Test route for backend
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

//NEW STUFF

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (err, results) => {
        if (err) {
          reject(err); // Reject promise in case of an error
        } else {
          resolve(results[0]); // Return the first user found
        }
      }
    );
  });
};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Debugging: Log the received email and password
  console.log("Received email:", email);
  console.log("Received password:", password);

  try {
    // Get the user from the database by email
    const user = await getUserByEmail(email);

    // Debugging: Log the user fetched from the database
    console.log("User found in DB:", user);

    if (user) {
      // Debugging: Log the hashed password stored in the database
      console.log("Stored password hash in DB:", user.password_hash);

      // Compare the provided password with the stored password hash
      if (user.password_hash === password) {
        console.log("Password match: true");

        // Password matched, send success response
        res.status(200).json({
          message: "Login successful",
          userId: user.user_id,
          // You can still send a token or session if needed
        });
      } else {
        // Debugging: Log when passwords do not match
        console.log("Password match: false");
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      console.log("User not found");
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    // Catch any errors and log them
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    // Fetch tasks from MySQL
    connection.query("SELECT * FROM tasks", async (err, results) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).send("Error fetching tasks");
      }

      // For each task, fetch dependencies from Neo4j
      const tasksWithDependencies = await Promise.all(
          results.map(async (task) => {
          const session = getSession();
          try {
            const query = `
                         MATCH (a:Task {taskId: $taskId})-[:DEPENDS_ON]->(b:Task)
                            RETURN b
                        `;
            const params = { taskId: parseFloat(task.task_id) };
            const result = await session.run(query, params);
            const dependencies = result.records.map((record) => {
              return record.get("b").properties;
            });

            return {
              task_id: task.task_id, // task ID
              title: task.title, // task Title
              description: task.description, // task Description
              status: task.status, // task Status
              due_date: task.due_date, // task Due Date
              assigned_to: task.assigned_to, // task Assigned To
              dependencies, // Dependencies from Neo4j
            };
          } catch (error) {
            console.error(
              "Error fetching dependencies for task:",
              task.task_id,
              error
            );
            return {
              ...task, // Return task with empty dependencies in case of error
              dependencies: [],
            };
          } finally {
            session.close();
          }
        })
      );

      // Send the combined result
      res.status(200).send(tasksWithDependencies);
    });
  } catch (error) {
    console.error("Error processing tasks and dependencies:", error);
    res.status(500).send("Error processing tasks and dependencies");
  }
});

app.post("/tasks", async (req, res) => {
  const { title, description, status, due_date, assigned_to } = req.body;

  // Log received data for debugging
  console.log("Received Task Data:", {
    title,
    description,
    status,
    due_date,
    assigned_to,
  });

  // Check for missing fields
  if (!title || !description || !status || !due_date || !assigned_to) {
    return res.status(400).send("Missing required fields");
  }

  // Insert task into MySQL
  const query =
    "INSERT INTO tasks (title, description, status, due_date, assigned_to) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    query,
    [title, description, status, due_date, assigned_to],
    async (err, result) => {
      if (err) {
        console.error("Error inserting task into MySQL:", err);
        return res.status(500).send("Error inserting task into MySQL");
      }

      console.log("Task inserted into MySQL with ID:", result.insertId);

      // Insert task into Neo4j
      const session = getSession(); // Assuming this is your method to get a Neo4j session
      const neo4jQuery = `
            CREATE (t:Task {taskId: $taskId, title: $title, description: $description, status: $status, due_date: $due_date, assigned_to: $assigned_to})
        `;
      const params = {
        taskId: result.insertId, // Use the MySQL task ID
        title,
        description,
        status,
        due_date,
        assigned_to,
      };

      try {
        await session.run(neo4jQuery, params);
        console.log("Task inserted into Neo4j");
        res.status(201).send({
          message: "Task created successfully",
          taskId: result.insertId,
        });
      } catch (neo4jError) {
        console.error("Error inserting task into Neo4j:", neo4jError);
        res.status(500).send("Error inserting task into Neo4j");
      } finally {
        session.close(); // Close the session after the operation
      }
    }
  );
});

// Update a task's status
app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = "UPDATE tasks SET status = ? WHERE task_id = ?";
  connection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating task:", err);
      return res.status(500).send("Error updating task");
    }

    res.send("Task updated");
  });
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const session = getSession(); // Assuming this is your method to get a Neo4j session

  // 1. Delete the task from MySQL
  const query = "DELETE FROM tasks WHERE task_id = ?";
  connection.query(query, [id], async (err, result) => {
    if (err) {
      console.error("Error deleting task from MySQL:", err);
      return res.status(500).send("Error deleting task from MySQL");
    }

    // 2. Delete the corresponding task node from Neo4j
    const neo4jQuery = `
            MATCH (t:Task {taskId: $taskId})
            DETACH DELETE t
        `;
    const params = { taskId: parseFloat(id) };

    try {
      const neo4jResult = await session.run(neo4jQuery, params);
      console.log("deleted")
      //await session.run(neo4jQuery, params);
      console.log("Task deleted from Neo4j");
      res.send("Task deleted from both MySQL and Neo4j");
    } catch (neo4jError) {
      console.error("Error deleting task from Neo4j:", neo4jError);
      res.status(500).send("Error deleting task from Neo4j");
    } finally {
      session.close(); // Close the session after the operation
    }
  });
});


// Add a new user
app.post("/users", (req, res) => {
  const { name, email, password_hash, role } = req.body;

  const query =
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)";
  connection.query(query, [name, email, password_hash, role], (err, result) => {
    if (err) {
      console.error("Error inserting user into database:", err);
      return res.status(500).send("Error inserting user into database");
    }

    res.status(201).send("User created");
  });
});

// Sync tasks to Neo4j
app.post("/tasks/sync-to-neo4j", async (req, res) => {
  try {
    const query = "SELECT * FROM tasks";
    connection.query(query, async (err, results) => {
      // Use mysqlConnection.query
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).send("Error fetching tasks from MySQL");
      }

      const session = driver.session();
      try {
        for (const task of results) {
          console.log("Syncing task:", task); // Log each task
          const result = await session.run(
            `
                        MERGE (t:Task {taskId: $taskId})
                        SET t.title = $title, t.description = $description, 
                            t.status = $status, t.due_date = $dueDate, 
                            t.assigned_to = $assignedTo
                        `,
            {
              taskId: task.task_id.toString(),
              title: task.title,
              description: task.description,
              status: task.status,
              dueDate: task.due_date.toISOString(),
              assignedTo: task.assigned_to.toString(),
            }
          );
          console.log("Query result:", result);
        }

        res
          .status(200)
          .send({ message: "Tasks synced to Neo4j successfully!" });
      } catch (error) {
        console.error("Neo4j Sync Error:", error);
        res.status(500).send("Error syncing tasks to Neo4j");
      } finally {
        await session.close();
      }
    });
  } catch (error) {
    console.error("Unexpected Error:", error);
    res.status(500).send("Unexpected error occurred");
  }
});

app.post("/tasks", async (req, res) => {
  const { title, description, status, due_date, assigned_to } = req.body;

  // Log received data for debugging
  console.log("Received Task Data:", {
    title,
    description,
    status,
    due_date,
    assigned_to,
  });

  // Check for missing fields
  if (!title || !description || !status || !due_date || !assigned_to) {
    return res.status(400).send("Missing required fields");
  }

  // Insert task into MySQL
  const query =
    "INSERT INTO tasks (title, description, status, due_date, assigned_to) VALUES (?, ?, ?, ?, ?)";
  connection.query(
    query,
    [title, description, status, due_date, assigned_to],
    async (err, result) => {
      if (err) {
        console.error("Error inserting task into MySQL:", err);
        return res.status(500).send("Error inserting task into MySQL");
      }

      console.log("Task inserted into MySQL with ID:", result.insertId);

      // Update task in Neo4j
      const session = getSession(); // Assuming this is your method to get a Neo4j session
      const neo4jQuery = `
            MERGE (t:Task {taskId: $taskId}) 
            SET t.title = $title, 
                t.description = $description, 
                t.status = $status, 
                t.due_date = $due_date, 
                t.assigned_to = $assigned_to
        `;
      const params = {
        taskId: Number(result.insertId), // Use the MySQL task ID
        title,
        description,
        status,
        due_date,
        assigned_to,
      };

      try {
        await session.run(neo4jQuery, params);
        console.log("Task updated in Neo4j");
        res.status(201).send({
          message: "Task created successfully",
          taskId: result.insertId,
        });
      } catch (neo4jError) {
        console.error("Error updating task in Neo4j:", neo4jError);
        res.status(500).send("Error updating task in Neo4j");
      } finally {
        session.close(); // Close the session after the operation
      }
    }
  );
});

app.post("/tasks/:taskId/dependencies", async (req, res) => {
  const session = getSession();
  const { taskId } = req.params;
  const { dependsOnTaskId } = req.body;

  if (!taskId || !dependsOnTaskId) {
    return res
      .status(400)
      .send({ error: "Task ID and Depends On Task ID are required" });
  }

  try {
    // First, check if the dependency already exists.
    const checkQuery = `
            MATCH (a:Task {taskId: $taskId})-[r:DEPENDS_ON]->(b:Task {taskId: $dependsOnTaskId})
            RETURN COUNT(r) > 0 AS dependencyExists
        `;
    const checkParams = {
      taskId: parseFloat(taskId),
      dependsOnTaskId: parseFloat(dependsOnTaskId),
    };

    const checkResult = await session.run(checkQuery, checkParams);
    
    
    const query = `
            MERGE (a:Task {taskId: $taskId})
            MERGE (b:Task {taskId: $dependsOnTaskId})
            MERGE (a)-[:DEPENDS_ON]->(b)
        `;
    const params = {
      taskId: parseFloat(taskId), // Ensures float type
      dependsOnTaskId: parseFloat(dependsOnTaskId), // Ensures float type
    };

    console.log("Query:", query); // Debugging
    console.log("Params:", params); // Debugging

    const result = await session.run(query, params);

    if (result.summary.counters.updates().relationshipsCreated > 0) {
      console.log("Dependency created:", result.summary.counters.updates());
      return res
        .status(201)
        .send({ message: "Dependency created successfully" });
    } else {
      return res
        .status(404)
        .send({ error: "One or both tasks not found in the database" });
    }
  } catch (error) {
    console.error("Error creating dependency:", error);
    return res.status(500).send({ error: "Internal server error" });
  } finally {
    session.close();
  }
});

//new
app.patch("/tasks/:id/status", async (req, res) => {
  const { id } = req.params; // Task ID
  const { status } = req.body; // New status value

  // Allowed statuses
  const allowedStatuses = ["Pending", "In Progress", "Completed"];

  // Validate status
  if (!allowedStatuses.includes(status)) {
    return res.status(400).send("Invalid status value");
  }

  // Update task status in MySQL
  const query = "UPDATE tasks SET status = ? WHERE task_id = ?";
  connection.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating task status in MySQL:", err);
      return res.status(500).send("Error updating task status in MySQL");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("Task not found");
    }

    res.send("Task status updated successfully");
  });
});

// Fetch task dependencies from Neo4j
app.get("/tasks/:taskId/dependencies", async (req, res) => {
  const session = getSession();
  const { taskId } = req.params;

  try {
    const query = `
            MATCH (a:Task {taskId: $taskId})-[:DEPENDS_ON]->(b:Task)
            RETURN b
        `;
    const params = { taskId: parseFloat(taskId) };
    const result = await session.run(query, params);
    console.log(result);
    const dependencies = result.records.map(
      (record) => record.get("b").properties
    );

    res.status(200).send({ dependencies });
  } catch (error) {
    console.error("Error fetching dependencies:", error);
    res.status(500).send("Error fetching dependencies");
  } finally {
    session.close();
  }
});





// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
