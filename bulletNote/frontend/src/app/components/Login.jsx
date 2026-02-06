import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { Lock, Mail, User, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // 自动跳转检查
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const resData = await api.get('/users/Info', {
          headers: { 'X-Skip-Alert': 'true' }
        });
        
        if (resData?.success) {
          console.log('login successfully', resData.data);
          navigate(`/notes/${resData.data.username}`, { replace: true });
        }
      } catch (err) {
        // 用户未登录，保持在登录页
      }
    };
    checkLoginStatus();
  }, [navigate]);

  // 切换表单
  const toggleForm = () => {
    setIsRegister(!isRegister);
    setErrorMsg('');
    setFormData({ usernameOrEmail: '', password: '' });
    setRegisterForm({ username: '', email: '', password: '' });
    setShowPassword(false);
  };

  // 登录表单输入处理
  const handleLoginChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg('');
  };

  // 注册表单输入处理
  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
    if (errorMsg) setErrorMsg('');
  };

  // 登录提交
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const res = await api.post('/users/login', formData);
      const info = await api.get('/users/info');
      navigate(`/notes/${info.data.username}`);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failure to login'
      );
    }
  };

  // 注册提交
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!registerForm.username || !registerForm.password) {
      setErrorMsg('Username and password cannot be empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await api.post('/users/register', {
        ...registerForm,
        email: registerForm.email.trim() || null
      });
      
      setErrorMsg('Register success!');
      const res = await api.post('/users/login', {
        usernameOrEmail: registerForm.username,
        password: registerForm.password
      });
      navigate('/notes');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failure to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>📝</div>
          <h1 className={styles.appTitle}>Bullet Note</h1>
          <p className={styles.appSubtitle}>Your thoughts, organized</p>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.formHeader}>
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {!isRegister && (
            <form className={styles.form} onSubmit={handleLoginSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <User className={styles.inputIcon} />
                  <span>Username or Email</span>
                </label>
                <input
                  type="text"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleLoginChange}
                  placeholder="Enter your username or email"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <Lock className={styles.inputIcon} />
                  <span>Password</span>
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

              <button type="submit" className={styles.submitBtn}>
                <LogIn size={20} />
                <span>Log In</span>
              </button>
            </form>
          )}

          {isRegister && (
            <form className={styles.form} onSubmit={handleRegisterSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <User className={styles.inputIcon} />
                  <span>Username <span className={styles.required}>*</span></span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={registerForm.username}
                  onChange={handleRegisterChange}
                  placeholder="Choose a username"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <Lock className={styles.inputIcon} />
                  <span>Password <span className={styles.required}>*</span></span>
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Create a password"
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <Mail className={styles.inputIcon} />
                  <span>Email (optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  placeholder="your.email@example.com"
                  className={styles.input}
                />
              </div>

              {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                <UserPlus size={20} />
                <span>{isSubmitting ? 'Creating...' : 'Register'}</span>
              </button>
            </form>
          )}

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button onClick={toggleForm} className={styles.toggleBtn}>
            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
