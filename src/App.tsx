import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Game from "./pages/Game"
import Home from "./pages/Home"
import Leaderboard from "./pages/Leaderboard"

const App = () => (
  <div className="app">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/games/:id" element={<Game />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  </div>
)

export default App
