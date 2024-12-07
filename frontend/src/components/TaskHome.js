import React from 'react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

const TaskHome = () => {
    // State, effects, and event handlers can be defined here if needed.

    return (
        <div>
             <TaskForm />
             <TaskList />
        </div>
    );
};

export default TaskHome;
