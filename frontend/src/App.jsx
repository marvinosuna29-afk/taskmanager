import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, Trash2, PlusCircle, AlertCircle, 
  RefreshCw, Layers, Circle, Sparkles, Search, Filter, Edit3, X, Save, Calendar, Sun, Moon
} from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [dateFilter, setDateFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const API_URL = 'http://127.0.0.1:5000/api/tasks';

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--text', '#9ca3af');
      root.style.setProperty('--text-h', '#f3f4f6');
      root.style.setProperty('--bg', '#16171d');
      root.style.setProperty('--border', '#2e303a');
      root.style.setProperty('--code-bg', '#1f2028');
      root.style.setProperty('--accent', '#c084fc');
      root.style.setProperty('--accent-bg', 'rgba(192, 132, 252, 0.15)');
      root.style.setProperty('--accent-border', 'rgba(192, 132, 252, 0.5)');
      localStorage.setItem('theme', 'dark');
    } else {
      root.style.setProperty('--text', '#6b6375');
      root.style.setProperty('--text-h', '#08060d');
      root.style.setProperty('--bg', '#fff');
      root.style.setProperty('--border', '#e5e4e7');
      root.style.setProperty('--code-bg', '#f4f3ec');
      root.style.setProperty('--accent', '#aa3bff');
      root.style.setProperty('--accent-bg', 'rgba(170, 59, 255, 0.1)');
      root.style.setProperty('--accent-border', 'rgba(170, 59, 255, 0.5)');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      showAlert('Unable to connect to backend server. Is it running?');
    }
  };

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showAlert('Validation Error: Task Title cannot be empty!');
      return;
    }

    try {
      await axios.post(API_URL, { title, description });
      fetchTasks();
      setTitle('');
      setDescription('');
    } catch (error) {
      showAlert('Failed to save task. Please try again.');
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      const response = await axios.put(`${API_URL}/${id}`, { is_completed: nextStatus });
      setTasks(tasks.map(task => (task.id === id ? response.data : task)));
    } catch (error) {
      showAlert('Failed to update task status.');
    }
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleSaveEdit = async (id) => {
    if (!editTitle.trim()) {
      showAlert('Validation Error: Task Title cannot be empty!');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/${id}`, { 
        title: editTitle, 
        description: editDescription 
      });
      setTasks(tasks.map(task => (task.id === id ? response.data : task)));
      cancelEditing();
    } catch (error) {
      showAlert('Failed to save changes to task.');
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      showAlert('Failed to delete task.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed === 1 || t.is_completed === true).length;
  const activeTasks = totalTasks - completedTasks;

  const filteredTasks = tasks.filter(task => {
    const isTaskCompleted = task.is_completed === 1 || task.is_completed === true;
    
    if (statusFilter === 'active' && isTaskCompleted) return false;
    if (statusFilter === 'completed' && !isTaskCompleted) return false;

    if (task.created_at) {
      const taskDateObj = new Date(task.created_at);
      const year = taskDateObj.getFullYear();
      const month = String(taskDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(taskDateObj.getDate()).padStart(2, '0');
      const taskLocalStr = `${year}-${month}-${day}`;

      if (dateFilter === 'today') {
        const todayObj = new Date();
        const tYear = todayObj.getFullYear();
        const tMonth = String(todayObj.getMonth() + 1).padStart(2, '0');
        const tDay = String(todayObj.getDate()).padStart(2, '0');
        const todayLocalStr = `${tYear}-${tMonth}-${tDay}`;
        
        if (taskLocalStr !== todayLocalStr) return false;
      } 
      else if (dateFilter === 'custom' && customDate) {
        if (taskLocalStr !== customDate) return false;
      }
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    if (query === 'completed' || query === 'complete' || query === 'done') {
      return isTaskCompleted;
    }
    if (query === 'active' || query === 'pending' || query === 'not completed') {
      return !isTaskCompleted;
    }

    const matchTitle = task.title.toLowerCase().includes(query);
    const matchDesc = (task.description || '').toLowerCase().includes(query);
    return matchTitle || matchDesc;
  });

  return (
    <div style={{ 
      padding: '40px 24px', 
      textAlign: 'left',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Dynamic Alert Banner */}
      {alertMessage && (
        <div style={{ position: 'fixed', top: '32px', right: '32px', backgroundColor: 'var(--code-bg)', color: 'var(--text-h)', padding: '16px 24px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow)', zIndex: 1000, border: '1px solid var(--border)' }}>
          <AlertCircle size={18} style={{ color: 'red' }} />
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Sparkles size={14} /> Hi, User
          </div>
          <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: 'var(--text-h)' }}>Task Manager</h2>
        </div>
        
        {/* ACTION BUTTON UTILITIES CONTAINER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* THEME TOGGLE ELEMENT */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--code-bg)', cursor: 'pointer', color: 'var(--text-h)', transition: 'all 0.2s' }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button onClick={fetchTasks} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--code-bg)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-h)', transition: 'all 0.2s' }}>
            <RefreshCw size={14} /> Reload
          </button>
        </div>
      </header>

      {/* Grid Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '40px', alignItems: 'start', flex: 1 }}>
        
        {/* LEFT SIDEBAR: Entry Form & Stats Pod */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Input Card */}
          <div style={{ backgroundColor: 'var(--code-bg)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: 'var(--text-h)' }}>New Task</h3>
            
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Task Title</label>
                <input 
                  type="text" 
                  placeholder="Task objective..." 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text-h)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Description</label>
                <textarea 
                  placeholder="Scope criteria/details..." 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid var(--border)', outline: 'none', backgroundColor: 'var(--bg)', color: 'var(--text-h)', minHeight: '90px', resize: 'vertical' }}
                />
              </div>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                <PlusCircle size={16} /> Deploy Task
              </button>
            </form>
          </div>

          {/* Metrics Display */}
          <div style={{ backgroundColor: 'var(--code-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-h)' }}>{totalTasks}</div>
              <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>Total</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent)' }}>{activeTasks}</div>
              <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>Active</div>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#34d399' }}>{completedTasks}</div>
              <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '2px' }}>Done</div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE: Interactive Control Panel & Task Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Filtering Bar Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'var(--code-bg)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            
            {/* Search Input Bar */}
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px', fontSize: '14px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-h)', outline: 'none' }}
              />
            </div>

            {/* Status Dropdown Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
              <Filter size={14} style={{ color: 'var(--text)' }} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
              >
                <option value="all">All Tracking</option>
                <option value="active">Active</option>
                <option value="completed">Done</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
              <Calendar size={14} style={{ color: 'var(--text)' }} />
              <select 
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  if (e.target.value !== 'custom') setCustomDate('');
                }}
                style={{ padding: '8px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-h)', cursor: 'pointer', outline: 'none' }}
              >
                <option value="all">All Dates</option>
                <option value="today">Created Today</option>
                <option value="custom">Pick Specific Date</option>
              </select>
            </div>

            {/*DYNAMIC CALENDAR PICKER OVERLAY*/}
            {dateFilter === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
                <input 
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  style={{ padding: '7px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-h)', outline: 'none' }}
                />
              </div>
            )}

          </div>

          {/* Interactive Core Cards Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text)', border: '2px dashed var(--border)', borderRadius: '8px', backgroundColor: 'var(--code-bg)' }}>
                <Layers size={36} style={{ color: 'var(--border)', marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, fontSize: '15px' }}>Empty Stream Node</div>
              </div>
            ) : (
              filteredTasks.map(task => {
                const isDone = task.is_completed === 1 || task.is_completed === true;
                const isEditing = editingId === task.id;

                return (
                  <div 
                    key={task.id} 
                    style={{ 
                      padding: '20px 24px', 
                      borderRadius: '8px', 
                      border: isEditing ? '1px solid var(--accent)' : '1px solid var(--border)', 
                      display: 'flex', 
                      gap: '16px', 
                      alignItems: 'flex-start', 
                      backgroundColor: 'var(--code-bg)',
                      opacity: (isDone && !isEditing) ? 0.6 : 1,
                      boxShadow: 'var(--shadow)'
                    }}
                  >
                    {/* Completion Trigger Checkbox */}
                    {!isEditing && (
                      <button 
                        onClick={() => handleToggleComplete(task.id, task.is_completed)}
                        style={{ background: 'none', border: 'none', padding: '2px 0 0 0', cursor: 'pointer', color: isDone ? '#10b981' : 'var(--text)' }}
                      >
                        {isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
                      </button>
                    )}

                    {/* Data Display Content Field */}
                    <div style={{ flex: 1 }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input 
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '14px', fontWeight: 600, borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-h)', outline: 'none' }}
                          />
                          <textarea 
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-h)', outline: 'none', minHeight: '60px', resize: 'vertical' }}
                          />
                        </div>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, textDecoration: isDone ? 'line-through' : 'none', color: 'var(--text-h)' }}>
                              {task.title}
                            </h4>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, backgroundColor: isDone ? 'var(--border)' : 'var(--accent-bg)', color: isDone ? 'var(--text)' : 'var(--accent)' }}>
                              {isDone ? 'Done' : 'Active'}
                            </span>
                            
                            {/* Explicit Timestamp Label */}
                            <span style={{ fontSize: '11px', color: 'var(--text)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {formatDate(task.created_at)}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text)', lineHeight: '1.5', textDecoration: isDone ? 'line-through' : 'none' }}>
                            {task.description || 'No descriptive context attached.'}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Operational Actions Layout */}
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {isEditing ? (
                        <>
                          <button onClick={() => handleSaveEdit(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#34d399', padding: '4px' }} title="Save"><Save size={16} /></button>
                          <button onClick={cancelEditing} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px' }} title="Cancel"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEditing(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px' }} title="Edit"><Edit3 size={16} /></button>
                          <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px' }} title="Delete"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;