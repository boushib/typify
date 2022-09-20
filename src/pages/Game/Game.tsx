import { useCallback, useEffect, useRef, useState } from 'react'
import { GAME_DURATION } from '../../constants'
import { formatToNDigits, getRandomChar } from '../../utils'
import './Game.sass'

const Game = () => {
  const [score, setScore] = useState(0)
  const [char, setChar] = useState(getRandomChar())
  const [milliseconds, setMilliseconds] = useState(0)
  const [seconds, setSeconds] = useState(GAME_DURATION)
  const timer = useRef<ReturnType<typeof setInterval>>()
  const [isGameOver, setIsGameOver] = useState(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === char) {
        setScore(score + 1)
        setChar(getRandomChar())
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [char]
  )

  useEffect(() => {
    const date = new Date()
    timer.current = setInterval(() => handleUpdateTime(date), 1)

    return () => {
      clearInterval(timer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const handleUpdateTime = (startTime: Date) => {
    const timeDiff = new Date().getTime() - startTime.getTime()
    const s = GAME_DURATION - Math.floor(timeDiff / 1000) - 1
    const ms = 1000 - (timeDiff % 1000)
    setSeconds(s)
    setMilliseconds(ms)

    if (s <= 0) {
      setSeconds(0)
      setMilliseconds(0)
      setIsGameOver(true)
      clearInterval(timer.current)
    }
  }

  return (
    <div className="game page">
      <div className="container">
        <div className="game__header">
          <div className="game__score">Score {score}</div>
          <div className="game__time">
            <span className="game__time__label">Time </span>
            <span className="game__time__value">
              {formatToNDigits(seconds, 2)}:{formatToNDigits(milliseconds, 3)}
            </span>
          </div>
        </div>
        {isGameOver && <div className="game__end">Game Over!</div>}
        {!isGameOver && <div className="game__char">{char}</div>}
      </div>
    </div>
  )
}

export default Game
