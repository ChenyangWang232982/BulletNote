import { useState, useEffect } from 'react';
import api from '../utils/axios';
import styles from './NoteList.module.css';

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

  // Fetch all notes from the backend
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await api.get('/notes');
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input value changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle new note creation
  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    try {
      const newNote = await api.post('/notes', formData);
      setNotes(prev => [newNote, ...prev]);
      resetForm();
    } catch (err) {
      console.error('Failed to create note: ', err);
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
  };

  // Handle note update submission
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !editingId) return;

    try {
      const updatedNote = await api.put(`/notes/${editingId}`, formData);
      setNotes(prev => prev.map(note => note.id === editingId ? updatedNote : note));
      resetForm();
    } catch (err) {
      console.error('Failed to update note: ', err);
    }
  };

  // Handle note deletion with confirmation
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  // Reset form data and editing status
  const resetForm = () => {
    setFormData({ title: '', content: '', category: '' });
    setEditingId(null);
  };

  // Fetch notes when component mounts
  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <> {/* 用空标签包裹，避免多余DOM节点 */}
      {/* 标题容器：单独抽离出container，实现占满整行效果【核心修改：结构调整】 */}
      <div className={styles.titleLayout}>
        <h1 className={styles.titlePanel}>🔹 Bullet Note</h1>
      </div>
      {/* 主容器：专门承载左表单+右列表的并排布局 */}
      <div className={styles.container}>
        {/* 左侧面板：表单 */}
        <div className={styles.rowPanel}>
          <form
            onSubmit={editingId ? handleUpdateNote : handleCreateNote}
            className={styles.form}
          >
            <h3 className={styles.formTitle}>
              {editingId ? 'Edit Note' : 'Create New Note'}
            </h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Title：</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter note title"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Content：</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter note content"
                className={styles.textarea}
                rows={5}
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
              />
            </div>

            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitBtn}>
                {editingId ? 'Update Note' : 'Add Note'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={styles.cancelBtn}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
            
        {/* 右侧面板：笔记列表 */}
        <div className={styles.notesList}>
          <h2 className={styles.listTitle}>My Notes</h2>
            
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : notes.length === 0 ? (
            <p className={styles.empty}>No notes yet</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className={styles.noteCard}>
                <div className={styles.noteHeader}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  <span className={styles.noteCategory}>{note.category}</span>
                </div>

                <p className={styles.noteContent}>{note.content}</p>

                <div className={styles.noteMeta}>
                  <span className={styles.noteTime}>
                    {new Date(note.createdAt).toLocaleString()}
                  </span>

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
    </>
  );
};
export default NoteList;