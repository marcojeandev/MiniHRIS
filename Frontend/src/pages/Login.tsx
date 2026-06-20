import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const data = await login({ email, password });
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        navigate('/admin');
      } else {
        // Fallback for cookie-based sanctum auth without specific token in response
        navigate('/admin');
      }
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>MiniHRIS</h1>
          <p>Sign in to your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="login-btn">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
