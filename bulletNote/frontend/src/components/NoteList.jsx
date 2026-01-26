import { useState, useEffect } from 'react';
import api from '../utils/axios';
import styles from './NoteList.module.css';
import { useNavigate } from 'react-router-dom';

const NoteList = () => {
  // State for storing note list data
  const [notes, setNotes] = useState([]);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for form input data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  // State for storing the id of the note being edited
  const [editingId, setEditingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();
  

  //fetch userdata
  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const userRes = await api.get('/users/Info');
      const userData = userRes?.success ? userRes.data : null;
      setUserInfo(userData);
      const noteRes = await api.get('/notes');
      const noteData = noteRes?.success && Array.isArray(noteRes.data) ? noteRes.data : [];
      setNotes(noteData);
      console.log('user info：', userData);
      console.log('note list：', noteData);

    } catch (err) {
      setNotes([]);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      const msg = err.response?.data?.message || 'Failed to load data';
      setErrorMsg(msg);
      console.error('Failure to load data：', err);
    } finally {
      setLoading(false); 
    }
  }

  // Handle form input value changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  //validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMsg('Note title cannot be empty!');
      return false;
    }
    if(!formData.content.trim()) {
      setErrorMsg('Note content cannot be empty!');
      return false;
    }
    return true;
  }

  // Handle new note creation
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setFormSubmitting(true);
      const submitData = {
        ...formData,
        category: formData.category.trim() || 'default'
      };
      const res = await api.post('/notes', submitData);
      if (res?.success) {
        setNotes(prev => [res.data, ...prev]);
        resetForm();
      }
    } catch (err) {
      if (err.response?.status === 401) return navigate('/login');
      const msg = err.response?.data?.message || 'Failed to create note';
      setErrorMsg(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Populate form with note data for editing
  const handleEditNote = (note) => {
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category
    });
    setEditingId(note.id);
    setErrorMsg('');
    document.querySelector(`.${styles.form}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle note update submission
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!validateForm() || !editingId) return;

    try {
      setFormSubmitting(true);
      const submitData = {
        ...formData,
        category: formData.category.trim() || 'default'
      };
      const res = await api.put(`/notes/${editingId}`, submitData);
      if (res?.success) {
        setNotes(prev => prev.map(note => note.id === editingId ? res.data : note));
        resetForm();
      }
    } catch (err) {
      if (err.response?.status === 401) return navigate('/login');
      const msg = err.response?.data?.message || 'Failed to update note';
      setErrorMsg(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle note deletion with confirmation
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await api.delete(`/notes/${id}`);
      if (res?.success) {
        setNotes(prev => prev.filter(note => note.id !== id));
      }
    } catch (err) {
      if (err.response?.status === 401) return navigate('/login');
      setErrorMsg('Failed to delete note');
    }
  };

  // Reset form data and editing status
  const resetForm = () => {
    setFormData({ title: '', content: '', category: '' });
    setEditingId(null);
  };

  useEffect(() => {
    fetchData();
  }, []);


  const formatTime = (timeStr) => {
    if (!timeStr) return 'Unknown';
    const date = new Date(timeStr);
    return date.toString() === 'Invalid Date' ? 'Unknown' : date.toLocaleString();
  };

  const handleLogout = async () => {
    try {
      await api.post('/users/logout'); 
      navigate('/login'); 
    } catch (err) {
      console.error('Failed to logout：', err);
      setErrorMsg('Logout failed, please try again');
    }
  };

  //useEffect(()=> {
  //  const testNote = [
  //  {
  //    id: 1,
  //    title: 'Test Note',
  //    content: 'This is a test note',
  //    category: 'default',
  //    createdAt: new Date().toISOString()
  //  }
  //];
  //  setNotes(testNote);
  //},[]);

  return (
    <div className={styles.noteListWrapper}>
      {errorMsg && (
        <div className={styles.errorMsgMask} onClick={() => setErrorMsg('')}>
          <div className={styles.errorMsgModal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.errorMsgClose} 
              onClick={() => setErrorMsg('')}
          >
             ×
          </button>
          <p className={styles.errorMsgText}>{errorMsg}</p>
      </div>
    </div>
  )}

      <div className={styles.titleLayout}>
        <h1 className={styles.titlePanel}>🔹 Bullet Note</h1>
        <span className={styles.userinfo}>Welcome, <strong>{userInfo?.username || 'User'}</strong><button onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button></span>
      </div>

      <div className={styles.container}>
        <div className={styles.rowPanel}>
          <form
            onSubmit={editingId ? handleUpdateNote : handleCreateNote}
            className={styles.form}
            noValidate
          >
            <h3 className={styles.formTitle}>
              {editingId ? '📝 Edit Note' : '✏️ Create New Note'}
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Title：</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter note title (required)"
                className={styles.input}
                disabled={formSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Content：</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter note content (required)"
                className={styles.textarea}
                rows={5}
                disabled={formSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Category：</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter category (optional)"
                className={styles.input}
                disabled={formSubmitting}
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={formSubmitting}
              >
                {formSubmitting ? 'Processing...' : (editingId ? 'Update Note' : 'Add Note')}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={styles.cancelBtn}
                  disabled={formSubmitting}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className={styles.notesList}>
          <h2 className={styles.listTitle}>My Notes ({Array.isArray(notes) ? notes.length : 0})</h2>

          {loading ? (
            <p className={styles.loading}>Loading notes...</p>
          ) : Array.isArray(notes) && notes.length === 0 ? (
            <p className={styles.empty}>📭 No notes yet, create your first note!</p>
          ) : (
            Array.isArray(notes) && notes.map((note) => (
              <div key={note.id} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  <span className={styles.noteCategory}>{note.category}</span>
                </div>

                <p className={styles.noteContent}>{note.content}</p>

                <div className={styles.noteMeta}>
                  <span className={styles.noteTime}>{formatTime(note.createdAt)}</span>
                  <div className={styles.noteBtnGroup}>
                    <button
                      onClick={() => handleEditNote(note)}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteList;