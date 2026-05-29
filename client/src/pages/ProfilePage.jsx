import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'recommendations'

  // Безпечно дістаємо дані користувача з контексту
  const currentUserData = user?.user || user;
  const userId = currentUserData?.id;
  const username = currentUserData?.username || currentUserData?.name || 'Користувач';
  const email = currentUserData?.email || '';

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      try {
        // Одночасно завантажуємо квитки юзера та всі фільми для системи рекомендацій
        const [ticketsRes, moviesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/user/tickets/${userId}`),
          axios.get(`http://localhost:5000/api/movies`)
        ]);

        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        setAllMovies(Array.isArray(moviesRes.data) ? moviesRes.data : []);
      } catch (err) {
        console.error("Помилка завантаження даних профілю:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  // --- 🧠 РОЗУМНА СИСТЕМА РЕКОМЕНДАЦІЙ за твоїм запитом ---
  const getRecommendations = () => {
    if (tickets.length === 0) {
      // Якщо квитків ще немає, рекомендуємо фільми з найвищим рейтингом
      return [...allMovies]
        .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
        .slice(0, 4);
    }

    // Збираємо всі жанри з куплених квитків користувача
    const userGenres = tickets.map(t => t.genre?.toLowerCase().trim()).filter(Boolean);

    // Фільтруємо фільми з бази, які мають такий самий жанр, але які користувач ще не купив
    const boughtMovieTitles = tickets.map(t => t.title.toLowerCase());
    
    const recommended = allMovies.filter(movie => {
      const isAlreadyBought = boughtMovieTitles.includes(movie.title.toLowerCase());
      const hasMatchingGenre = userGenres.some(genre => movie.genre?.toLowerCase().includes(genre));
      return !isAlreadyBought && hasMatchingGenre;
    });

    // Якщо нічого не знайшли за збігом, просто повертаємо свіжі фільми, крім уже куплених
    return recommended.length > 0 
      ? recommended.slice(0, 4) 
      : allMovies.filter(m => !boughtMovieTitles.includes(m.title.toLowerCase())).slice(0, 4);
  };

  const recommendedMovies = getRecommendations();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#333' }}>
        <h2>Будь ласка, увійдіть до системи, щоб переглянути особистий кабінет!</h2>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', color: '#8e24aa' }}>Завантаження профілю...</div>;
  }

  return (
    <div style={containerStyle}>
      {/* 👤 КАРТКА ПРОФІЛЮ КОРИСТУВАЧА */}
      <div style={profileCardStyle}>
        <div style={avatarStyle}>
          {username[0].toUpperCase()}
        </div>
        <div style={profileInfoStyle}>
          <h2 style={usernameStyle}>{username}</h2>
          <p style={emailStyle}>📧 {email || 'Email не вказано'}</p>
        </div>
      </div>

      {/* 🎛 ПЕРЕМИКАЧ ВКЛАДОК (TABS) */}
      <div style={tabsContainerStyle}>
        <button 
          style={{ ...tabButtonStyle, ...(activeTab === 'tickets' ? activeTabStyle : {}) }}
          onClick={() => setActiveTab('tickets')}
        >
          Мої Квитки ({tickets.length})
        </button>
        <button 
          style={{ ...tabButtonStyle, ...(activeTab === 'recommendations' ? activeTabStyle : {}) }}
          onClick={() => setActiveTab('recommendations')}
        >
          Рекомендації для Вас 🔥
        </button>
      </div>

      {/* 🎟 СЕКЦІЯ 1: СПИСОК КВИТКІВ */}
      {activeTab === 'tickets' && (
        <div style={ticketsContainerStyle}>
          {tickets.length > 0 ? (
            tickets.map(ticket => (
              <div key={ticket.ticket_id} style={ticketCardStyle}>
                <img src={ticket.image} alt={ticket.title} style={ticketImageStyle} />
                <div style={ticketMetaStyle}>
                  <h3 style={ticketTitleStyle}>{ticket.title}</h3>
                  <p style={ticketTextStyle}>🍿 Жанр: {ticket.genre}</p>
                  <p style={ticketTextStyle}>📅 Дата: {new Date(ticket.show_time).toLocaleDateString('uk-UA')}</p>
                  <p style={ticketTextStyle}>⏱ Час: {new Date(ticket.show_time).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</p>
                  <div style={seatBadgeStyle}>
                    📍 {ticket.seat_details || 'Місця уточнюються'}
                  </div>
                </div>
                {/* Правий блок квитка з кодом */}
                <div style={qrSectionStyle}>
                  <div style={qrCodePlaceholderStyle}>QR</div>
                  <span style={ticketIdStyle}>#T-{ticket.ticket_id}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>
              🎬 Тут будуть відображатися ваші куплені квитки. Час сходити в кіно!
            </div>
          )}
        </div>
      )}

      {/* 🧠 СЕКЦІЯ 2: СИСТЕМА РЕКОМЕНДАЦІЙ */}
      {activeTab === 'recommendations' && (
        <div>
          <h3 style={recSectionTitleStyle}>
            {tickets.length > 0 
              ? `На основі ваших уподобань рекомендуємо фільми у жанрі схожому на ваші квитки:` 
              : `Популярно серед глядачів Cinema Future:`}
          </h3>
          <div style={gridStyle}>
            {recommendedMovies.map(movie => (
              <div key={movie.id} style={movieCardStyle}>
                <img src={movie.image} alt={movie.title} style={movieImageStyle} />
                <div style={movieMetaStyle}>
                  <h4 style={movieTitleStyle}>{movie.title}</h4>
                  <p style={movieGenreStyle}>{movie.genre} • <span style={{color: '#8e24aa', fontWeight: 'bold'}}>{movie.rating || '16+'}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- СТИЛІЗАЦІЯ В ОРИГІНАЛЬНІЙ СВІТЛІЙ ПАЛІТРІ ---
const containerStyle = { padding: '0 10% 60px 10%', backgroundColor: '#fff', minHeight: '100vh' };

const profileCardStyle = {
  display: 'flex', alignItems: 'center', gap: '25px', 
  background: 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)',
  borderRadius: '24px', padding: '35px 40px', color: '#fff', marginTop: '30px', marginBottom: '40px',
  boxShadow: '0 10px 25px rgba(43, 58, 191, 0.15)'
};

const avatarStyle = {
  width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#fff',
  color: '#4a148c', display: 'flex', justifyContent: 'center', alignItems: 'center',
  fontSize: '28px', fontWeight: '800', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
};

const profileInfoStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const usernameStyle = { fontSize: '26px', fontWeight: '800', margin: 0 };
const emailStyle = { fontSize: '15px', margin: 0, opacity: 0.9 };

// СТИЛІ ДЛЯ МЕНЮ (ТАБИ)
const tabsContainerStyle = { display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '2px solid #f3e5f5' };
const tabButtonStyle = {
  padding: '12px 20px', fontSize: '16px', fontWeight: '700', color: '#666',
  backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
  borderBottom: '3px solid transparent', paddingBottom: '12px'
};
const activeTabStyle = { color: '#8e24aa', borderBottom: '3px solid #8e24aa' };

// КАРТКИ КВИТКІВ
const ticketsContainerStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };
const ticketCardStyle = {
  display: 'flex', backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden',
  border: '1px solid #eee', boxShadow: '0 6px 18px rgba(0,0,0,0.03)'
};
const ticketImageStyle = { width: '120px', height: '170px', objectFit: 'cover' };
const ticketMetaStyle = { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', justifyContent: 'center' };
const ticketTitleStyle = { fontSize: '18px', fontWeight: '700', color: '#333', margin: '0 0 5px 0' };
const ticketTextStyle = { fontSize: '14px', color: '#666', margin: 0 };
const seatBadgeStyle = { alignSelf: 'flex-start', marginTop: '6px', padding: '4px 10px', backgroundColor: '#f3e5f5', color: '#4a148c', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };

const qrSectionStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', borderLeft: '1px dashed #e0e0e0', backgroundColor: '#fafafa' };
const qrCodePlaceholderStyle = { width: '55px', height: '55px', backgroundColor: '#333', color: '#fff', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' };
const ticketIdStyle = { fontSize: '11px', color: '#999', marginTop: '8px', fontWeight: '600' };

// СТИЛІ РЕКОМЕНДАЦІЙ
const recSectionTitleStyle = { fontSize: '18px', fontWeight: '700', color: '#444', marginBottom: '20px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '30px' };
const movieCardStyle = { display: 'flex', flexDirection: 'column', gap: '12px' };
const movieImageStyle = { width: '100%', height: '340px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 6px 15px rgba(0,0,0,0.05)' };
const movieMetaStyle = { display: 'flex', flexDirection: 'column', gap: '2px' };
const movieTitleStyle = { fontSize: '16px', fontWeight: '700', color: '#333', margin: 0 };
const movieGenreStyle = { fontSize: '13px', color: '#777', margin: 0 };

const emptyStateStyle = { textAlign: 'center', padding: '50px 20px', color: '#999', fontSize: '15px', fontStyle: 'italic', border: '1px dashed #ddd', borderRadius: '16px' };

export default ProfilePage;