import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Дані форми:", formData);
    // Тут буде запит до твого Express сервера
    alert(isLogin ? "Вхід виконано!" : "Акаунт створено!");
    navigate('/');
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', color: '#8e24aa', marginBottom: '20px' }}>
          {isLogin ? 'З поверненням!' : 'Створити акаунт'}
        </h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && (
            <input 
              style={inputStyle} type="text" placeholder="Ваше ім'я" required
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          )}
          <input 
            style={inputStyle} type="email" placeholder="Email" required
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            style={inputStyle} type="password" placeholder="Пароль" required
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button type="submit" className="promo-btn" style={{ width: '100%', marginTop: '10px' }}>
            {isLogin ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
          {isLogin ? "Ще не маєте акаунту?" : "Вже є акаунт?"}{' '}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
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
  borderRadius: '24px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
  backgroundColor: '#fff'
};

const inputStyle = {
  padding: '12px 16px', borderRadius: '12px', border: '1px solid #eee',
  fontSize: '15px', outline: 'none'
};

export default AuthPage;