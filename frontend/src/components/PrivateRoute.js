import React from 'react';
import { Route, Navigate } from 'react-router-dom';

// PrivateRoute component to protect routes
const PrivateRoute = ({ element, ...rest }) => {
    const token = localStorage.getItem('userId'); // Get the token from localStorage

    return (
        <Route
            {...rest}
            element={token ? element : <Navigate to="/login" />}
        />
    );
};

export default PrivateRoute;
