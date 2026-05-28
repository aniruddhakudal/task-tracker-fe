import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import DailySummary from '../components/DailySummary'
import './Dashboard.css'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [tasks, setTasks] = useState([])
  const [taskTypes, setTaskTypes] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { tasks: tasksList, taskTypes: typesList, summary: summaryData } =
        await api.getDashboardData(selectedDate)
      setTasks(tasksList)
      setTaskTypes(typesList)
      setSummary(summaryData)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleCreateTask(data) {
    await api.createTask(data)
    setShowForm(false)
    loadData()
  }

  async function handleUpdateTask(data) {
    await api.updateTask(editingTask.id, data)
    setEditingTask(null)
    loadData()
  }

  async function handleDeleteTask(id) {
    await api.deleteTask(id)
    if (editingTask?.id === id) setEditingTask(null)
    loadData()
  }

  async function handleToggleStatus(task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await api.updateTask(task.id, { status: newStatus })
    loadData()
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Task Tracker</h1>
          <p className="user-email">{user?.email}</p>
        </div>
        <button type="button" className="btn-logout" onClick={signOut}>
          Sign Out
        </button>
      </header>

      <div className="dashboard-content">
        <div className="date-picker">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {error && <div className="dashboard-error">{error}</div>}
        {loading && <div className="dashboard-loading">Loading...</div>}

        {!loading && summary && (
          <DailySummary summary={summary} />
        )}

        <div className="tasks-section">
          <div className="section-header">
            <h2>Tasks</h2>
            <button type="button" className="btn-primary" onClick={() => { setShowForm(true); setEditingTask(null); }}>
              + Add Task
            </button>
          </div>

          {showForm && (
            <TaskForm
              taskTypes={taskTypes}
              defaultDate={selectedDate}
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
            />
          )}

          {editingTask && (
            <TaskForm
              taskTypes={taskTypes}
              task={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          )}

          <TaskList
            tasks={tasks}
            taskTypes={taskTypes}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </div>
    </div>
  )
}
