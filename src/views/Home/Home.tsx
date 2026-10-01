import Link from "next/link"
import "./Home.sass"

const Home = () => (
  <div className="home page">
    <div className="container">
      <h1 className="home__heading">Ready?</h1>
      <Link href="/games/1" className="home__cta">
        Start Typing!
      </Link>
    </div>
  </div>
)

export default Home
