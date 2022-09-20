import { useState } from 'react'
import './Game.sass'

const Game = () => {
  const [char, setChar] = useState('S')
  return (
    <div className="game page">
      <div className="container">
        <div className="game__header">
          <div className="game__score">Score: 0</div>
          <div className="game__time">Time: 06:00</div>
        </div>
        <div className="game__char">{char}</div>
      </div>
    </div>
  )
}

export default Game
