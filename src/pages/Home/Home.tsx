import { Link } from 'react-router-dom'
import './Home.sass'

const Home = () => (
  <div className="home page">
    <div className="container">
      <h1 className="home__heading">Ready?</h1>
      <Link to="/games/1" className="home__cta">
        Start Typing!
      </Link>
    </div>
  </div>
)

export default Home
