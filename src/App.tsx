import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage'
import { ShowcasePage } from './pages/ShowcasePage'
import { NotFoundPage } from './pages/NotFoundPage'

function App() {
  return (
    <>
      <nav style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/">Home</Link>
        <Link to="/showcase">Showcase</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/showcase" element={<ShowcasePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App