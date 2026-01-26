import { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import style from './Login.module.css'

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
    const navigate = useNavigate();
    //Automatically jump
    useEffect(() => {
    const checkLoginStatus = async () => {
        try {
            const resData = await api.get('/users/Info', {
                headers: { 'X-Skip-Alert': 'true' }
            }); 
            
            if (resData?.success) { 
                console.log('login successfully', resData.data);
                navigate('/notes', { replace: true }); 
            }
        } catch (err) {
        }
        };
        checkLoginStatus();
    }, [navigate]);

    
    //reset the form
    const toggleForm = () => {
      setIsRegister(!isRegister);
      setErrorMsg('');
      setFormData({usernameOrEmail: '', password: ''});
      setRegisterForm({ username: '', email: '', password: '' });
    }
    //package the input
    const handleLoginChange = (e) => {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value
        });
        if (errorMsg) setErrorMsg('')
    };
    //package the register input
    const handleRegisterChange = (e) => {
      setRegisterForm({
        ...registerForm,
        [e.target.name]: e.target.value
        });
        if (errorMsg) setErrorMsg('');
      };
    //handle input
    const handleLoginSubmit = async (e) =>{
        e.preventDefault();
        setErrorMsg('');
        console.log('formData：', formData);
        console.log('JSON format：', JSON.stringify(formData));
        try {
            const res =await api.post('/users/login', formData);
            navigate('/notes');
        } catch (err) {
            setErrorMsg(
                err.response?.data?.message || 'Failure to login'
            );
        }
    };

    const handleRegisterSubmit = async (e) => {
      e.preventDefault();
      setErrorMsg('');
      if(!registerForm.username || !registerForm.password) {
        setErrorMsg('Username and password cannot be empty');
        return;
      }
      try {
        setIsSubmitting(true);
        console.log('Register:', registerForm);
        await api.post('/users/register', {
          ...registerForm,
          email: registerForm.email.trim() || null
        });
        setErrorMsg('Register success!');
        const res =await api.post('/users/login', {
          usernameOrEmail: registerForm.username,
          password: registerForm.password
        });
        navigate('/notes');
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Failure to register')
      } finally {
        setIsSubmitting(false);
      }
    }

  

    return (
        <div style={{width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute'}}>
            <div className={style.loggingContainer}>
                <h2 style={{
                    textAlign: 'center',
                    fontSize: '24px',
                    color: '#333',
                    margin: 0,
                    fontWeight: 600,
                }}>
                    {isRegister ? 'Register BULLET NOTE' : 'Logto BULLET NOTE'}
                </h2>

                {!isRegister && (
                    <form className={style.loginForm} onSubmit={handleLoginSubmit}>
                        <div>
                            <label>Username/Email：</label>
                            <input
                                type="text"
                                name="usernameOrEmail"
                                value={formData.usernameOrEmail}
                                onChange={handleLoginChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleLoginChange}
                                required
                            />
                        </div>
                        <div className={style.messageBlock}>
                            {errorMsg ? <p className={style.message}>{errorMsg}</p> : null}
                        </div>
                        <button type="submit">Log in</button>
                    </form>
                )}

                {isRegister && (
                    <form className={style.loginForm} onSubmit={handleRegisterSubmit}>
                        <div>
                            <label><font style={{color:'red'}}>*</font>Username：</label>
                            <input
                                type="text"
                                name="username"
                                value={registerForm.username}
                                onChange={handleRegisterChange}
                                required
                            />
                        </div>
                        <div>
                            <label><font style={{color:'red'}}>*</font>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Email：</label>
                            <input
                                type="email"
                                name="email"
                                value={registerForm.email}
                                onChange={handleRegisterChange}
                            />
                        </div>
                        <div className={style.messageBlock}>
                            {errorMsg ? <p className={style.message}>{errorMsg}</p> : null}
                        </div>
                        <button type="submit">Register</button>
                    </form>
                )}

                <button onClick={toggleForm}>
                    {isRegister ? 'Turn back to Login' : 'Go to Register'}
                </button>
            </div>
        </div>
    );
};

export default Login;