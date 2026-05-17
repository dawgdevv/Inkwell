import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NoteEditor from './pages/NoteEditor'
import Login from './pages/Login'
import Register from './pages/Register'
import Shared from './pages/Shared'
import About from './pages/About'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/note/:id" element={<NoteEditor />} />
        <Route path="/note/new" element={<NoteEditor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shared" element={<Shared />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  )
}

export default App
