// export default Login;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from './logo.png';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      navigate("/"); // Set the state to true if userId exists in localStorage
    }
  }, []); // Hook to redirect after login

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3002/login", {
        email,
        password,
      });

      // If login is successful
      console.log("Login successful:", response.data);

      // Store userId in localStorage
      localStorage.setItem("userId", response.data.userId);

      // Update authentication state to true
      setIsAuthenticated(true);

      // Redirect to the task management page
      navigate("/"); // Adjust based on your routes
    } catch (error) {
      // If login fails, show error
      console.error("Login failed:", error);
      setError("Invalid credentials");
    }
  };


return (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fc' }}>
    <div
      style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '24px', color: '#333' }}>
        <img src={Logo}  alt="Logo" style={{ width: '120px', marginBottom: '20px' }} />
        <h2 style={{ color: '#333' }}>LOGIN</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              textAlign: 'left',
              color: '#555',
            }}
          >
            Your email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              marginBottom: '20px',
            }}
          />
        </div>
        <div style={{ marginBottom: '30px' }}>
          <label
            style={{
              display: 'block',
              fontWeight: '600',
              marginBottom: '8px',
              textAlign: 'left',
              color: '#555',
            }}
          >
            Your password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {error && (
          <div
            style={{
              color: 'red',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'left',
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3db46d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#35a15e'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3db46d'}
        >
          Sign in
        </button>
      </form>
    </div>
  </div>
);

        };
export default Login;
