import SignUp from './pages/SignUp.jsx'
import './App.css'
import { AuthProvider } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import { Route,Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/LandingPage.jsx'
import Feed from './pages/Feed.jsx'

function App() {


  return (
    <>
      <AuthProvider>
     <Routes>
        <Route path="/signup"                element={<SignUp />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/feed" element={
          <ProtectedRoute>
            <Feed />
            {/* <div>Feed coming soon</div> */}
          </ProtectedRoute>
        }/>
 
        <Route path="/"  element={<Landing/>} />
        {/* <Route path="*"  element={<Navigate to="/feed" replace />} /> */}
 
      </Routes>
    </AuthProvider>
    </>
  )
}

export default App
