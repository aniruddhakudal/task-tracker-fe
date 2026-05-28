import './DailySummary.css'

export default function DailySummary({ summary }) {
  const { total_tasks, completed_tasks, completion_rate, total_calories, total_calories_burned, tasks_by_type } = summary

  return (
    <div className="daily-summary">
      <h3>Daily Summary</h3>
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-value">{total_tasks}</span>
          <span className="summary-label">Total Tasks</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{completed_tasks}</span>
          <span className="summary-label">Completed</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{completion_rate}%</span>
          <span className="summary-label">Completion Rate</span>
        </div>
        {total_calories != null && total_calories > 0 && (
          <div className="summary-card">
            <span className="summary-value">{Math.round(total_calories)}</span>
            <span className="summary-label">Calories (in)</span>
          </div>
        )}
        {total_calories_burned != null && total_calories_burned > 0 && (
          <div className="summary-card">
            <span className="summary-value">{Math.round(total_calories_burned)}</span>
            <span className="summary-label">Calories Burned</span>
          </div>
        )}
      </div>
      {Object.keys(tasks_by_type).length > 0 && (
        <div className="tasks-by-type">
          <span className="summary-label">By type:</span>
          <div className="type-badges">
            {Object.entries(tasks_by_type).map(([type, count]) => (
              <span key={type} className="type-badge">
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
