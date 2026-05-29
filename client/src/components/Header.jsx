import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App'; // Імпортуємо контекст з App.jsx

const Header = () => {
  const navigate = useNavigate();
  // Отримуємо дані користувача та функцію виходу з глобального контексту
  const { user, logout } = useContext(AuthContext);

  const handleLogout = (e) => {
    e.stopPropagation(); // Зупиняємо перехід у профіль при кліку на "Вийти"
    if (window.confirm("Ви впевнені, що хочете вийти?")) {
      logout();
      navigate('/');
    }
  };

  return (
    <header style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '15px 10%', borderBottom: '1px solid #eee', backgroundColor: '#fff',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      {/* Логотип */}
      <div 
        style={{ fontSize: '24px', fontWeight: 'bold', color: '#8e24aa', cursor: 'pointer' }} 
        onClick={() => navigate('/')}
      >
        🟣 Cinema Future
      </div>

      {/* Навігація */}
      <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>Тернопіль, ТРЦ «Подоляни»</span>
        
        <button 
          onClick={() => navigate('/schedule')}
          style={{ 
            padding: '8px 18px', borderRadius: '20px', border: '1px solid #ddd', 
            backgroundColor: 'transparent', cursor: 'pointer', fontWeight: '500',
            transition: '0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f9f9f9'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Розклад сеансів
        </button>

        {/* Секція користувача */}
        {user ? (
          /* 🎉 ТЕПЕР УСЯ ПЛАШКА КОРИСТУВАЧА КЛІКАБЕЛЬНА ДЛЯ ПЕРЕХОДУ В ПРОФІЛЬ */
          <div 
            onClick={() => navigate('/profile')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px', 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '24px',
              transition: '0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fcf8ff'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                {user.username || user.name}
              </span>
              <span 
                onClick={handleLogout}
                style={{ fontSize: '12px', color: '#8e24aa', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Вийти
              </span>
            </div>
            {/* Аватарка (перша літера імені) */}
            <div style={{ 
              width: '35px', height: '35px', borderRadius: '50%', 
              backgroundColor: '#8e24aa', color: '#fff', 
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              fontWeight: 'bold', fontSize: '14px',
              boxShadow: '0 2px 8px rgba(142, 36, 170, 0.2)'
            }}>
              {(user.username || user.name || 'U')[0].toUpperCase()}
            </div>
          </div>
        ) : (
          <span 
            onClick={() => navigate('/auth')}
            style={{ 
              cursor: 'pointer', fontWeight: '600', color: '#333',
              padding: '8px 15px', transition: '0.2s'
            }}
          >
            Увійти
          </span>
        )}
      </nav>
    </header>
  );
};

export default Header;