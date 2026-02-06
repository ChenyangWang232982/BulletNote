import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import styles from './NoteList.module.css';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Search, LogOut, 
  BookOpen, Tag, Calendar, X, Check 
} from 'lucide-react';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchResultNote, setSearchResultNote] = useState(null);
  
  const navigate = useNavigate();

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setErrorMsg('Note title cannot be empty!');
      return false;
    }
    if (!formData.content.trim()) {
      setErrorMsg('Note content cannot be empty!');
      return false;
    }
    return true;
  };

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

  const handleEditNote = (note) => {
    setFormData({
      title: note.title,
      content: note.content,
      category: note.category
    });
    setEditingId(note.id);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        setSearchResultNote(prev => 
          Array.isArray(prev) ? prev.map(note => note.id === editingId ? res.data : note) : prev
        );
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

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const res = await api.delete(`/notes/${id}`);
      if (res?.success) {
        setNotes(prev => prev.filter(note => note.id !== id));
        const filteredSearch = Array.isArray(searchResultNote) 
          ? searchResultNote.filter(note => note.id !== id) 
          : null;
        setSearchResultNote(filteredSearch);
        if (Array.isArray(filteredSearch) && filteredSearch.length === 0) {
          setSearchModalVisible(false);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) return navigate('/login');
      setErrorMsg('Failed to delete note');
    }
  };

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
      navigate('/login');
    }
  };

  const searchNoteByTitle = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const targetTitle = searchTitle.trim();
      if (!targetTitle) {
        setErrorMsg('Note title cannot be empty!');
        return;
      }

      const res = await api.get(`/notes/title/${targetTitle}`);
      if (!res?.success) {
        setErrorMsg(res?.data?.message || 'Cannot find this note!');
        setSearchResultNote(null);
        setSearchModalVisible(false);
        return;
      }

      setSearchResultNote(res.data);
      setSearchModalVisible(true);
      setSearchTitle('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Server error, failed to search note!';
      setErrorMsg(errMsg);
      setSearchResultNote(null);
      setSearchModalVisible(false);
      console.error('Search note failed：', err);
    } finally {
      setLoading(false);
    }
  };

  const closeSearchModal = () => {
    setSearchModalVisible(false);
    setSearchResultNote(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchNoteByTitle();
    }
  };

  return (
    <div className={styles.noteListWrapper}>
      {/* Error Modal */}
      {errorMsg && (
        <div className={styles.modalOverlay} onClick={() => setErrorMsg('')}>
          <div className={styles.errorModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setErrorMsg('')}>
              <X size={20} />
            </button>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorText}>{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchModalVisible && Array.isArray(searchResultNote) && searchResultNote.length > 0 && (
        <div className={styles.modalOverlay} onClick={closeSearchModal}>
          <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeSearchModal}>
              <X size={20} />
            </button>
            <h3 className={styles.searchModalTitle}>
              <Search size={20} />
              Search Results ({searchResultNote.length})
            </h3>
            <div className={styles.searchResults}>
              {searchResultNote.map(note => (
                <div key={note.id} className={styles.noteCard}>
                  <div className={styles.noteHeader}>
                    <h3 className={styles.noteTitle}>{note.title}</h3>
                    <span className={styles.noteCategory}>
                      <Tag size={14} />
                      {note.category}
                    </span>
                  </div>
                  <p className={styles.noteContent}>{note.content}</p>
                  <div className={styles.noteFooter}>
                    <span className={styles.noteTime}>
                      <Calendar size={14} />
                      {formatTime(note.createdAt)}
                    </span>
                    <div className={styles.noteActions}>
                      <button
                        onClick={() => {
                          handleEditNote(note);
                          closeSearchModal();
                        }}
                        className={styles.editBtn}
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className={styles.deleteBtn}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              <BookOpen size={28} />
              <h1 className={styles.appName}>Bullet Note</h1>
            </div>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.welcomeMsg}>
              Welcome, <strong>{userInfo?.username || 'User'}</strong>
            </span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.container}>
          {/* Note Form */}
          <div className={styles.formSection}>
            <form
              onSubmit={editingId ? handleUpdateNote : handleCreateNote}
              className={styles.noteForm}
            >
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>
                  {editingId ? (
                    <>
                      <Edit2 size={20} />
                      Edit Note
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create New Note
                    </>
                  )}
                </h2>
              </div>

              <div className={styles.formBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Title</label>
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
                  <label className={styles.label}>Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Enter note content (required)"
                    className={styles.textarea}
                    rows={6}
                    disabled={formSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
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

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>Processing...</>
                    ) : editingId ? (
                      <>
                        <Check size={18} />
                        Update Note
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Add Note
                      </>
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className={styles.cancelBtn}
                      disabled={formSubmitting}
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Notes List */}
          <div className={styles.notesSection}>
            <div className={styles.notesHeader}>
              <h2 className={styles.sectionTitle}>
                My Notes ({Array.isArray(notes) ? notes.length : 0})
              </h2>
              <div className={styles.searchBar}>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.searchInput}
                  disabled={loading || formSubmitting}
                />
                <button
                  onClick={searchNoteByTitle}
                  className={styles.searchBtn}
                  disabled={loading || formSubmitting || !searchTitle.trim()}
                >
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading notes...</p>
              </div>
            ) : Array.isArray(notes) && notes.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <p className={styles.emptyText}>No notes yet</p>
                <p className={styles.emptySubtext}>Create your first note to get started!</p>
              </div>
            ) : (
              <div className={styles.notesGrid}>
                {Array.isArray(notes) && notes.map((note) => (
                  <div key={note.id} className={styles.noteCard}>
                    <div className={styles.noteHeader}>
                      <h3 className={styles.noteTitle}>{note.title}</h3>
                      <span className={styles.noteCategory}>
                        <Tag size={14} />
                        {note.category}
                      </span>
                    </div>
                    <p className={styles.noteContent}>{note.content}</p>
                    <div className={styles.noteFooter}>
                      <span className={styles.noteTime}>
                        <Calendar size={14} />
                        {formatTime(note.createdAt)}
                      </span>
                      <div className={styles.noteActions}>
                        <button
                          onClick={() => handleEditNote(note)}
                          className={styles.editBtn}
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className={styles.deleteBtn}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteList;
