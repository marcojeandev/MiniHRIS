import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Attendance from './pages/Attendance'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App