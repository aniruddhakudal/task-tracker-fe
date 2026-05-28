import { supabase } from './supabase'

function raiseIfError(result, fallbackMessage = 'Request failed') {
  if (result.error) {
    const msg = result.error.message || fallbackMessage
    if (result.error.code === 'PGRST301' || /jwt|session/i.test(msg)) {
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    throw new Error(msg)
  }
  return result.data
}

function buildDailySummary(date, tasks) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const completion_rate = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0
  let total_calories = 0
  let total_calories_burned = 0
  const tasks_by_type = {}
  for (const t of tasks) {
    const tt = t.task_type_id || ''
    tasks_by_type[tt] = (tasks_by_type[tt] || 0) + 1
    const custom = t.custom_data || {}
    if (tt === 'meal') total_calories += Number(custom.calories) || 0
    if (tt === 'workout') total_calories_burned += Number(custom.calories_burned) || 0
  }
  return {
    date,
    total_tasks: total,
    completed_tasks: completed,
    completion_rate,
    total_calories: total_calories > 0 ? total_calories : null,
    total_calories_burned: total_calories_burned > 0 ? total_calories_burned : null,
    tasks_by_type,
  }
}

function pickTaskFields(data) {
  const row = {}
  const keys = [
    'task_type_id',
    'title',
    'description',
    'task_date',
    'task_time',
    'status',
    'priority',
    'custom_data',
    'recurrence',
  ]
  for (const k of keys) {
    if (data[k] !== undefined) row[k] = data[k]
  }
  return row
}

function normalizeCustomFields(rows) {
  return (rows || []).map((row) => {
    let cf = row.custom_fields
    if (typeof cf === 'string') {
      try {
        cf = JSON.parse(cf)
      } catch {
        cf = []
      }
    }
    return { ...row, custom_fields: Array.isArray(cf) ? cf : [] }
  })
}

export const api = {
  async getTaskTypes() {
    const res = await supabase.from('task_types').select('*').order('name')
    return normalizeCustomFields(raiseIfError(res) || [])
  },

  async getTasks(params = {}) {
    const { task_date, task_type_id, status } = params
    let q = supabase
      .from('tasks')
      .select('*')
      .order('task_date', { ascending: false })
      .order('task_time', { ascending: false })
    if (task_date) q = q.eq('task_date', task_date)
    if (task_type_id) q = q.eq('task_type_id', task_type_id)
    if (status) q = q.eq('status', status)
    const res = await q
    return raiseIfError(res) || []
  },

  /** Single round-trip for dashboard: tasks for a date, types, and summary. */
  async getDashboardData(date) {
    const [tasks, taskTypes] = await Promise.all([
      this.getTasks({ task_date: date }),
      this.getTaskTypes(),
    ])
    return {
      tasks,
      taskTypes,
      summary: buildDailySummary(date, tasks),
    }
  },

  async createTask(data) {
    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData.user) throw new Error('Not authenticated')
    const row = {
      user_id: userData.user.id,
      ...pickTaskFields(data),
      custom_data: data.custom_data || {},
    }
    const res = await supabase.from('tasks').insert(row).select().single()
    return raiseIfError(res)
  },

  async updateTask(id, data) {
    const row = pickTaskFields(data)
    if (Object.keys(row).length === 0) throw new Error('No fields to update')
    const res = await supabase.from('tasks').update(row).eq('id', id).select().single()
    return raiseIfError(res)
  },

  async deleteTask(id) {
    const res = await supabase.from('tasks').delete().eq('id', id).select('id')
    raiseIfError(res)
  },

  async getDailySummary(date) {
    const tasks = await this.getTasks({ task_date: date })
    return buildDailySummary(date, tasks)
  },
}
