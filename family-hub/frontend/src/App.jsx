import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Shopping from './pages/Shopping';
import Meals from './pages/Meals';
import Pantry from './pages/Pantry';

function Layout({ children }) {
  const { user, family, logout } = useAuth();

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="logo">
          <span>🏠</span>
          Family Hub
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="/" className="nav-link">📅 Calendar</a>
          </li>
          <li className="nav-item">
            <a href="/tasks" className="nav-link">✅ Tasks</a>
          </li>
          <li className="nav-item">
            <a href="/shopping" className="nav-link">🛒 Shopping</a>
          </li>
          <li className="nav-item">
            <a href="/meals" className="nav-link">🍽️ Meals</a>
          </li>
          <li className="nav-item">
            <a href="/pantry" className="nav-link">🥫 Pantry</a>
          </li>
        </ul>
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ marginBottom: '10px', fontSize: '14px' }}>
            👤 {user?.name}
          </div>
          {family && (
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '10px' }}>
              Family: {family.name}
            </div>
          )}
          <button onClick={logout} className="logout-btn" style={{ width: '100%' }}>
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Calendar /></PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
          <Route path="/shopping" element={<PrivateRoute><Shopping /></PrivateRoute>} />
          <Route path="/meals" element={<PrivateRoute><Meals /></PrivateRoute>} />
          <Route path="/pantry" element={<PrivateRoute><Pantry /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
