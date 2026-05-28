import { useEffect, useState } from 'react'
import './TaskForm.css'

export default function TaskForm({ taskTypes, task, defaultDate, onSubmit, onCancel }) {
  const isEdit = !!task
  const [taskTypeId, setTaskTypeId] = useState(task?.task_type_id || 'task')
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [taskDate, setTaskDate] = useState(task?.task_date || defaultDate || new Date().toISOString().slice(0, 10))
  const [taskTime, setTaskTime] = useState(task?.task_time ? task.task_time.slice(0, 5) : '')
  const [status, setStatus] = useState(task?.status || 'pending')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [customData, setCustomData] = useState(task?.custom_data || {})
  const [recurrence, setRecurrence] = useState(task?.recurrence || 'none')

  const selectedType = taskTypes.find((t) => t.id === taskTypeId)
  const customFields = selectedType?.custom_fields || []

  useEffect(() => {
    if (!isEdit) {
      setCustomData({})
    }
  }, [taskTypeId, isEdit])

  function handleCustomChange(name, value) {
    setCustomData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      task_type_id: taskTypeId,
      title,
      description: description || null,
      task_date: taskDate,
      task_time: taskTime || null,
      status,
      priority,
      custom_data: customData,
      recurrence: recurrence === 'none' ? null : recurrence,
    }
    onSubmit(payload)
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Type
          <select value={taskTypeId} onChange={(e) => setTaskTypeId(e.target.value)} required>
            {taskTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.icon} {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />
        </label>
      </div>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          rows={2}
        />
      </label>

      <div className="form-row">
        <label>
          Date
          <input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} required />
        </label>
        <label>
          Time
          <input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      {customFields.length > 0 && (
        <div className="custom-fields">
          <h4>Additional details</h4>
          {customFields.map((f) => (
            <label key={f.name}>
              {f.label}
              {f.type === 'number' && (
                <input
                  type="number"
                  value={customData[f.name] ?? ''}
                  onChange={(e) => handleCustomChange(f.name, e.target.value ? Number(e.target.value) : '')}
                  placeholder={f.label}
                />
              )}
              {f.type === 'text' && (
                <input
                  type="text"
                  value={customData[f.name] ?? ''}
                  onChange={(e) => handleCustomChange(f.name, e.target.value)}
                  placeholder={f.label}
                />
              )}
              {f.type === 'boolean' && (
                <input
                  type="checkbox"
                  checked={!!customData[f.name]}
                  onChange={(e) => handleCustomChange(f.name, e.target.checked)}
                />
              )}
            </label>
          ))}
        </div>
      )}

      <label>
        Recurrence
        <select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
          <option value="none">None</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {isEdit ? 'Update' : 'Add'} Task
        </button>
      </div>
    </form>
  )
}
