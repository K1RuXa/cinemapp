import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../App';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const currentUserData = user?.user || user;
  const username = currentUserData?.username || currentUserData?.name;

  const handleLogout = (e) => {
    e.stopPropagation();
    if (window.confirm("Ви впевнені, що хочете вийти?")) {
      logout();
      navigate('/');
    }
  };

  return (
    <header style={headerStyle}>
      <div style={logoStyle} onClick={() => navigate('/')}>
        <div style={logoIconStyle}>🔮</div>
        <span style={logoTextStyle}>Cinema Future</span>
      </div>

      <nav style={navStyle}>
        <span style={locationStyle}>📍 Тернопіль, ТРЦ «Подоляни»</span>
        
        <button 
          onClick={() => navigate('/schedule')}
          style={scheduleBtnStyle}
          onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.borderColor = 'rgba(162, 89, 255, 0.4)'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
        >
          Розклад сеансів
        </button>

        {user ? (
          <div 
            onClick={() => navigate('/profile')}
            style={userBlockStyle}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={userInfoStyle}>
              <span style={userNameStyle}>{username}</span>
              <span onClick={handleLogout} style={logoutLinkStyle}>Вийти</span>
            </div>
            <div style={avatarStyle}>
              {(username || 'U')[0].toUpperCase()}
            </div>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/auth')}
            style={loginBtnStyle}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.03)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Увійти
          </button>
        )}
      </nav>
    </header>
  );
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '18px 8%',
  backgroundColor: 'rgba(20, 20, 31, 0.75)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  color: '#fff'
};

const logoStyle = { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' };
const logoIconStyle = { fontSize: '24px' };
const logoTextStyle = { fontSize: '22px', fontWeight: '900', background: 'linear-gradient(135deg, #fff 0%, #b39ddb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' };

const navStyle = { display: 'flex', alignItems: 'center', gap: '25px' };
const locationStyle = { fontSize: '13px', color: '#7a7a99', fontWeight: '500' };

const scheduleBtnStyle = {
  padding: '9px 20px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '50px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const userBlockStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  padding: '6px 14px',
  borderRadius: '50px',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  transition: 'all 0.2s ease'
};

const userInfoStyle = { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' };
const userNameStyle = { fontWeight: '700', fontSize: '14px', color: '#fff', letterSpacing: '-0.2px' };
const logoutLinkStyle = { fontSize: '11px', color: '#b39ddb', textDecoration: 'underline', marginTop: '2px', fontWeight: '500', transition: 'color 0.2s ease' };

const avatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: '#a259ff',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: '800',
  fontSize: '14px',
  boxShadow: '0 0 15px rgba(162, 89, 255, 0.3)'
};

const loginBtnStyle = {
  padding: '10px 24px',
  background: 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '50px',
  fontSize: '13px',
  fontWeight: '700',
  cursor: 'pointer',
  boxShadow: '0 4px 15px rgba(162, 89, 255, 0.3)',
  transition: 'transform 0.2s ease'
};

export default Header;