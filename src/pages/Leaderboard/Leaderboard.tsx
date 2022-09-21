import { useEffect, useState } from 'react'
import LeaderboardItem from '../../components/Navbar/LeaderboardItem'
import { ScoreRecord } from '../../models'
import './Leaderboard.sass'

const Leaderboard = () => {
  const [scoreRecords, setScoreRecords] = useState<Array<ScoreRecord>>([])

  useEffect(() => {
    const handleFetchScores = async () => {
      try {
        const res = await fetch(`/.netlify/functions/getScores`)
        const data = (await res.json()) as Array<ScoreRecord>
        setScoreRecords(data)
      } catch (err) {
        console.log(err)
      }
    }

    handleFetchScores()
  }, [])

  return (
    <div className="leaderboard page">
      <div className="container">
        <h1>Leaderboard</h1>
        <div className="score-records">
          {scoreRecords.map(({ id, username, score }, idx) => (
            <LeaderboardItem
              rank={idx + 1}
              username={username}
              score={score}
              key={id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
