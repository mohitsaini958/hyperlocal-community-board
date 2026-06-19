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
import MapView from './pages/MapView.jsx';
import CreatePost from './pages/CreatePost.jsx'
import PostDetail from './pages/PostDetail.jsx'
import { ToastContainer } from './components/Toast.jsx'

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
            <Feed />
        }/>
        <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>}/>
        <Route path='/map' element={<ProtectedRoute><MapView/></ProtectedRoute>}/>
        <Route path="/"  element={<Landing/>}/>
        <Route path="/posts/:id" element={<PostDetail/>} />
        {/* <Route path="*"  element={<Navigate to="/feed" replace />} /> */}
 
      </Routes>
    </AuthProvider>
    <ToastContainer/>
    </>
  )
}

export default App
