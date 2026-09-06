import SignUp from './pages/SignUp.jsx'
import './App.css'
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/LandingPage.jsx'
import Feed from './pages/Feed.jsx'
import MapView from './pages/MapView.jsx';
import CreatePost from './pages/CreatePost.jsx'
import PostDetail from './pages/PostDetail.jsx'
import { ToastContainer } from './components/Toast.jsx'

// Redirect already-logged-in users away from login/signup
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <Navigate to="/feed" replace /> : children;
};

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          {/* guest-only — redirect to feed if already logged in */}
          <Route path="/signup"                element={<GuestRoute><SignUp /></GuestRoute>} />
          <Route path="/login"                 element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/forgot-password"       element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* protected — redirect to login if not authenticated */}
          <Route path="/feed"   element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
          <Route path="/map"    element={<ProtectedRoute><MapView /></ProtectedRoute>} />

          {/* public */}
          <Route path="/"           element={<Landing />} />
          <Route path="/posts/:id"  element={<PostDetail />} />

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <ToastContainer/>
    </>
  );
}

export default App