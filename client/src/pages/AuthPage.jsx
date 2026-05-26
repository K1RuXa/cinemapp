import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App'; // Контекст з App.jsx

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState(''); // Стан для виведення помилок
  const [loading, setLoading] = useState(false); // Стан завантаження

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    // Динамічний URL залежно від обраної форми
    const url = isLogin 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';

    try {
      setLoading(true);
      const response = await axios.post(url, formData);
      
      // Передаємо дані користувача в глобальний стан App.jsx
      login(response.data.user);
      
      // Зберігаємо JWT токен у браузері
      localStorage.setItem('token', response.data.token);
      
      // Повертаємося на головну сторінку
      navigate('/');
    } catch (err) {
      console.error("Помилка авторизації:", err);
      // Відображаємо помилку від бекенду, якщо вона є
      setError(err.response?.data?.error || 'Щось пішло не так. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#8e24aa', marginBottom: '20px', fontWeight: '700' }}>
          {isLogin ? 'З поверненням!' : 'Створити акаунт'}
        </h2>

        {/* Відображення помилки, якщо вона є */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee', color: '#c62828', padding: '10px', 
            borderRadius: '10px', marginBottom: '15px', textAlign: 'center', fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input 
              style={inputStyle} 
              type="text" 
              placeholder="Ваше ім'я" 
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          )}
          <input 
            style={inputStyle} 
            type="email" 
            placeholder="Email" 
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            style={inputStyle} 
            type="password" 
            placeholder="Пароль" 
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button 
            type="submit" 
            className="promo-btn" 
            disabled={loading}
            style={{ 
              width: '100%', 
              marginTop: '10px',
              padding: '14px',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: '#8e24aa',
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 5px 15px rgba(142, 36, 170, 0.3)'
            }}
          >
            {loading ? 'Зачекайте...' : isLogin ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          {isLogin ? "Ще не маєте акаунту?" : "Вже є акаунт?"}{' '}
          <span 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ email: '', password: '', username: '' });
            }} 
            style={{ color: '#8e24aa', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? 'Реєстрація' : 'Увійти'}
          </span>
        </p>
      </div>
    </div>
  );
};

// Стилі
const containerStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  minHeight: '80vh', padding: '0 10%'
};

const cardStyle = {
  width: '100%', maxWidth: '400px', padding: '40px',
  borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
  backgroundColor: '#fff',
  border: '1px solid #f5f5f5'
};

const inputStyle = {
  padding: '14px 20px', borderRadius: '12px', border: '1px solid #eee',
  fontSize: '15px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box'
};

export default AuthPage;