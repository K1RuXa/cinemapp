import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [hoveredItemId, setHoveredItemId] = useState(null);

  const currentUserData = user?.user || user;
  const userId = currentUserData?.id;
  const username = currentUserData?.username || currentUserData?.name || 'Користувач';
  const email = currentUserData?.email || '';

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      try {
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

  const getRecommendations = () => {
    if (tickets.length === 0) {
      return [...allMovies]
        .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
        .slice(0, 4);
    }

    const userGenres = tickets.map(t => t.genre?.toLowerCase().trim()).filter(Boolean);
    const boughtMovieTitles = tickets.map(t => t.title.toLowerCase());
    
    const recommended = allMovies.filter(movie => {
      const isAlreadyBought = boughtMovieTitles.includes(movie.title.toLowerCase());
      const hasMatchingGenre = userGenres.some(genre => movie.genre?.toLowerCase().includes(genre));
      return !isAlreadyBought && hasMatchingGenre;
    });

    return recommended.length > 0 
      ? recommended.slice(0, 4) 
      : allMovies.filter(m => !boughtMovieTitles.includes(m.title.toLowerCase())).slice(0, 4);
  };

  const recommendedMovies = getRecommendations();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#fff', backgroundColor: '#0d0d15', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Будь ласка, увійдіть до системи, щоб переглянути особистий кабінет!</h2>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', color: '#a259ff', backgroundColor: '#0d0d15', minHeight: '100vh' }}>Завантаження профілю...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={profileCardStyle}>
        <div style={cardBgPatternStyle}></div>
        
        <div style={cardHeaderStyle}>
          <div style={avatarStyle}>
            {username[0].toUpperCase()}
          </div>
          <div style={profileInfoStyle}>
            <div style={badgeStyle}>CINEMA FUTURE PASS</div>
            <h2 style={usernameStyle}>{username}</h2>
            <p style={emailStyle}>📧 {email || 'Email не вказано'}</p>
          </div>
        </div>

        <div style={cardMetaStyle}>
          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>СТАТУС АКАУНТА</span>
            <span style={metaValueStyle}>Premium VIP 🔥</span>
          </div>
          <div style={metaItemStyle}>
            <span style={metaLabelStyle}>КЛУБНА КАРТКА</span>
            <span style={metaValueStyle}>#CF-{String(userId).padStart(4, '0')}</span>
          </div>
        </div>
      </div>

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

      {activeTab === 'tickets' && (
        <div style={ticketsContainerStyle}>
          {tickets.length > 0 ? (
            tickets.map(ticket => {
              const isHovered = hoveredItemId === ticket.ticket_id;
              return (
                <div 
                  key={ticket.ticket_id} 
                  style={{
                    ...ticketCardStyle,
                    borderColor: isHovered ? 'rgba(162, 89, 255, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    boxShadow: isHovered ? '0 10px 30px rgba(142, 36, 170, 0.12)' : 'none',
                    transform: isHovered ? 'translateY(-4px)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredItemId(ticket.ticket_id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
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

                  <div style={qrSectionStyle}>
                    <div style={qrCodePlaceholderStyle}>QR</div>
                    <span style={ticketIdStyle}>#T-{ticket.ticket_id}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={emptyStateStyle}>
              <span style={{ fontSize: '40px', marginBottom: '10px', display: 'block' }}>🎬</span>
              <h3 style={{ margin: '0 0 6px 0', color: '#fff', fontSize: '18px' }}>У вас ще немає квитків</h3>
              <p style={{ margin: 0, color: '#6c6c80', fontSize: '14px' }}>Куплені квитки миттєво з'являться тут.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div>
          <h3 style={recSectionTitleStyle}>
            {tickets.length > 0 
              ? `На основі ваших уподобань рекомендуємо фільми схожих жанрів:` 
              : `Популярно серед глядачів Cinema Future:`}
          </h3>
          <div style={gridStyle}>
            {recommendedMovies.map(movie => {
              const isHovered = hoveredItemId === movie.id;
              return (
                <div 
                  key={movie.id} 
                  style={{
                    ...movieCardStyle,
                    borderColor: isHovered ? 'rgba(162, 89, 255, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    boxShadow: isHovered ? '0 10px 30px rgba(142, 36, 170, 0.12)' : 'none',
                    transform: isHovered ? 'translateY(-6px)' : 'none'
                  }}
                  onMouseEnter={() => setHoveredItemId(movie.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <img src={movie.image} alt={movie.title} style={movieImageStyle} />
                  <div style={movieMetaStyle}>
                    <h4 style={movieTitleStyle}>{movie.title}</h4>
                    <p style={movieGenreStyle}>{movie.genre} • <span style={{color: '#a259ff', fontWeight: 'bold'}}>{movie.rating || '16+'}</span></p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle = { padding: '0 8% 60px 8%', backgroundColor: '#0d0d15', minHeight: '100vh', color: '#fff' };

const profileCardStyle = {
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #1e1e2f 0%, #4a148c 50%, #8e24aa 100%)',
  borderRadius: '28px',
  padding: '40px',
  color: '#fff',
  marginTop: '30px',
  marginBottom: '40px',
  boxShadow: '0 15px 35px rgba(142, 36, 170, 0.25)',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '30px'
};

const cardBgPatternStyle = {
  position: 'absolute',
  top: '-50px',
  right: '-50px',
  width: '250px',
  height: '250px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.03)',
  pointerEvents: 'none'
};

const cardHeaderStyle = { display: 'flex', alignItems: 'center', gap: '25px', zIndex: 2 };

const avatarStyle = {
  width: '85px',
  height: '85px',
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  color: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '36px',
  fontWeight: '800',
  border: '2px solid rgba(255, 255, 255, 0.25)',
  boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
};

const badgeStyle = {
  alignSelf: 'flex-start',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: '4px 12px',
  borderRadius: '50px',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1.5px',
  color: '#e1bee7',
  marginBottom: '6px',
  display: 'inline-block'
};

const profileInfoStyle = { display: 'flex', flexDirection: 'column' };
const usernameStyle = { fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.5px' };
const emailStyle = { fontSize: '14px', margin: 0, opacity: 0.7, fontWeight: '500' };

const cardMetaStyle = {
  display: 'flex',
  gap: '40px',
  backgroundColor: 'rgba(0, 0, 0, 0.15)',
  padding: '20px 30px',
  borderRadius: '20px',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  zIndex: 2
};

const metaItemStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const metaLabelStyle = { fontSize: '10px', fontWeight: '700', color: '#b39ddb', letterSpacing: '1px' };
const metaValueStyle = { fontSize: '15px', fontWeight: '700', color: '#fff' };

const tabsContainerStyle = { display: 'flex', gap: '20px', marginBottom: '35px', borderBottom: '2px solid rgba(255, 255, 255, 0.04)' };

const tabButtonStyle = {
  padding: '12px 24px', fontSize: '15px', fontWeight: '700', color: '#6c6c80',
  backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
  borderBottom: '3px solid transparent', paddingBottom: '14px'
};

const activeTabStyle = { color: '#a259ff', borderBottom: '3px solid #a259ff' };

const ticketsContainerStyle = { display: 'flex', flexDirection: 'column', gap: '24px' };

const ticketCardStyle = {
  display: 'flex', backgroundColor: '#14141f', borderRadius: '24px', overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.04)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  flexWrap: 'wrap'
};

const ticketImageStyle = { width: '110px', height: '160px', objectFit: 'cover' };

const ticketMetaStyle = { padding: '20px 25px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' };
const ticketTitleStyle = { fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 2px 0', letterSpacing: '-0.5px' };
const ticketTextStyle = { fontSize: '14px', color: '#6c6c80', margin: 0, fontWeight: '500' };

const seatBadgeStyle = { 
  alignSelf: 'flex-start', marginTop: '8px', padding: '6px 14px', 
  backgroundColor: 'rgba(162, 89, 255, 0.12)', color: '#a259ff', 
  borderRadius: '10px', fontSize: '13px', fontWeight: '700',
  border: '1px solid rgba(162, 89, 255, 0.2)' 
};

const qrSectionStyle = { 
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
  padding: '0 40px', borderLeft: '1px dashed rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.01)' 
};

const qrCodePlaceholderStyle = { 
  width: '60px', height: '60px', backgroundColor: '#fff', color: '#14141f', 
  borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
  fontSize: '13px', fontWeight: '900', letterSpacing: '1px', boxShadow: '0 0 20px rgba(255,255,255,0.1)' 
};

const ticketIdStyle = { fontSize: '12px', color: '#525266', marginTop: '10px', fontWeight: '700' };

const recSectionTitleStyle = { fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '25px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '30px' };

const movieCardStyle = { 
  display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#14141f', 
  padding: '16px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.04)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
};

const movieImageStyle = { width: '100%', height: '320px', objectFit: 'cover', borderRadius: '18px' };
const movieMetaStyle = { display: 'flex', flexDirection: 'column', gap: '4px' };
const movieTitleStyle = { fontSize: '17px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.3px' };
const movieGenreStyle = { fontSize: '13px', color: '#6c6c80', margin: 0, fontWeight: '500' };

const emptyStateStyle = { 
  textAlign: 'center', padding: '60px 40px', backgroundColor: '#14141f', 
  borderRadius: '24px', border: '1px dashed rgba(255, 255, 255, 0.06)', maxWidth: '500px', margin: '20px auto 0 auto' 
};

export default ProfilePage;