import "./LeaderboardItem.sass"

interface Props {
  rank: number
  username: string
  score: number
}

const LeaderboardItem = ({ rank, username, score }: Props) => (
  <div className="leaderboard-item">
    <div className={`leaderboard-item__rank leaderboard-item__rank--${rank}`}>
      <span>{rank}</span>
    </div>
    <div className="leaderboard-item__username">{username}</div>
    <div className="leaderboard-item__score">{score}</div>
  </div>
)

export default LeaderboardItem
