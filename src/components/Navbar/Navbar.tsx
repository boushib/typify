import { Link, NavLink } from 'react-router-dom'
import './Navbar.sass'

const Navbar = () => (
  <nav className="nav">
    <div className="container nav__container">
      <Link to="/" className="nav__logo">
        Typify
      </Link>
      <div className="nav__menu">
        <NavLink to="/" className="nav__menu__item">
          Home
        </NavLink>
        <NavLink to="/leaderboard" className="nav__menu__item">
          Leaderboard
        </NavLink>
      </div>
    </div>
  </nav>
)

export default Navbar
