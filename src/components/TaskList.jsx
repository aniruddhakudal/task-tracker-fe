import './TaskList.css'

export default function TaskList({ tasks, taskTypes, onEdit, onDelete, onToggleStatus }) {
  const getTypeInfo = (id) => taskTypes.find((t) => t.id === id) || { name: id, icon: '•' }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <p>No tasks for this date. Click "Add Task" to get started.</p>
      </div>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => {
        const typeInfo = getTypeInfo(task.task_type_id)
        const custom = task.custom_data || {}
        const isCompleted = task.status === 'completed'

        return (
          <li key={task.id} className={`task-item ${isCompleted ? 'completed' : ''}`}>
            <div className="task-check" onClick={() => onToggleStatus(task)}>
              <span className="checkbox">{isCompleted ? '✓' : ''}</span>
            </div>
            <div className="task-main">
              <div className="task-header">
                <span className="task-type">{typeInfo.icon} {typeInfo.name}</span>
                <span className={`task-priority ${task.priority}`}>{task.priority}</span>
              </div>
              <h4 className="task-title">{task.title}</h4>
              {task.description && <p className="task-desc">{task.description}</p>}
              <div className="task-meta">
                {task.task_time && <span>{task.task_time.slice(0, 5)}</span>}
                {custom.calories != null && custom.calories > 0 && (
                  <span className="meta-badge">🍽️ {custom.calories} cal</span>
                )}
                {custom.calories_burned != null && custom.calories_burned > 0 && (
                  <span className="meta-badge">🔥 {custom.calories_burned} burned</span>
                )}
                {custom.duration_minutes != null && custom.duration_minutes > 0 && (
                  <span className="meta-badge">⏱️ {custom.duration_minutes} min</span>
                )}
              </div>
            </div>
            <div className="task-actions">
              <button type="button" className="btn-icon" onClick={() => onEdit(task)} title="Edit">
                ✏️
              </button>
              <button type="button" className="btn-icon btn-danger" onClick={() => onDelete(task.id)} title="Delete">
                🗑️
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
