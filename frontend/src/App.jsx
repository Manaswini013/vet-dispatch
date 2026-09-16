import { Route, Routes } from 'react-router-dom'
import FarmerHome from './pages/FarmerHome.jsx'
import ReportEmergency from './pages/ReportEmergency.jsx'
import VetDashboard from './pages/VetDashboard.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<FarmerHome />} />
      <Route path="/report" element={<ReportEmergency />} />
      <Route path="/vet" element={<VetDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
