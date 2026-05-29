import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SchedulePage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMovieId, setHoveredMovieId] = useState(null);
  
  const formatDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(formatDateString(new Date()));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const moviesResponse = await axios.get('http://localhost:5000/api/movies');
        const sessionsResponse = await axios.get('http://localhost:5000/api/sessions');
        
        setMovies(Array.isArray(moviesResponse.data) ? moviesResponse.data : []);
        setSessions(Array.isArray(sessionsResponse.data) ? sessionsResponse.data : []);
      } catch (error) {
        console.error("Помилка завантаження розкладу:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDaysArray = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(formatDateString(d));
    }
    return dates;
  };

  const getSessionDateStr = (showTime) => {
    if (!showTime) return '';
    if (typeof showTime === 'string' && showTime.includes('T')) {
      return showTime.split('T')[0];
    }
    const d = new Date(showTime);
    return isNaN(d.getTime()) ? '' : formatDateString(d);
  };

  const formatSessionTime = (showTime) => {
    if (!showTime) return '--:--';
    const d = new Date(showTime);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const months = ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв', 'Лип', 'Серп', 'Верес', 'Жовт', 'Лист', 'Груд'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', color: '#a259ff', backgroundColor: '#0d0d15', minHeight: '100vh' }}>Завантаження розкладу...</div>;
  }

  const hasSessionsOnSelectedDate = movies.some(movie => {
    return sessions.some(session => {
      return session.movie_id === movie.id && getSessionDateStr(session.show_time) === selectedDate;
    });
  });

  return (
    <div style={containerStyle}>
      <h1 style={pageTitleStyle}>Повний розклад сеансів</h1>
      <p style={subtitleStyle}>Обирай зручний час та бронюй квитки в ТРЦ «Подоляни»</p>

      <div style={datePickerContainer}>
        {getDaysArray().map((date) => {
          const isActive = selectedDate === date;
          return (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                ...dateButtonStyle,
                background: isActive ? 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#fff' : '#858599',
                borderColor: isActive ? '#a259ff' : 'rgba(255,255,255,0.05)',
                boxShadow: isActive ? '0 6px 20px rgba(162, 89, 255, 0.3)' : 'none'
              }}
            >
              {formatDateLabel(date)}
            </button>
          );
        })}
      </div>

      <div style={moviesListStyle}>
        {movies.map((movie) => {
          const movieSessions = sessions.filter(session => {
            return session.movie_id === movie.id && getSessionDateStr(session.show_time) === selectedDate;
          });

          if (movieSessions.length === 0) return null;
          const isHovered = hoveredMovieId === movie.id;

          return (
            <div 
              key={movie.id} 
              style={{
                ...movieCardStyle,
                borderColor: isHovered ? 'rgba(162, 89, 255, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                boxShadow: isHovered ? '0 10px 30px rgba(142, 36, 170, 0.08)' : 'none'
              }}
              onMouseEnter={() => setHoveredMovieId(movie.id)}
              onMouseLeave={() => setHoveredMovieId(null)}
            >
              {movie.image ? (
                <img 
                  src={movie.image} 
                  alt={movie.title} 
                  style={{
                    width: '120px',
                    height: '170px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    flexShrink: 0,
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              ) : (
                <div style={posterPlaceholderStyle}>
                  <span style={{ fontSize: '30px' }}>🎬</span>
                </div>
              )}

              <div style={movieInfoStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <h2 style={movieTitleStyle}>{movie.title}</h2>
                  <span style={ratingBadgeStyle}>{movie.rating || '16+'}</span>
                </div>
                <p style={movieGenreStyle}>🍿 {movie.genre}</p>
                
                <div style={sessionsContainerStyle}>
                  {movieSessions.map((session) => (
                    <button 
                      key={session.id} 
                      style={sessionTimeButtonStyle}
                      onClick={() => navigate(`/session/${session.id}`)}
                      onMouseOver={(e) => { e.target.style.background = 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)'; e.target.style.boxShadow = '0 4px 12px rgba(162, 89, 255, 0.3)'; }}
                      onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.05)'; e.target.style.boxShadow = 'none'; }}
                    >
                      {formatSessionTime(session.show_time)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {!hasSessionsOnSelectedDate && (
          <div style={noSessionsStyle}>
            <span style={{ fontSize: '40px', marginBottom: '10px', display: 'block' }}>🍿</span>
            <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '18px' }}>На цю дату сеансів більше немає</h3>
            <p style={{ margin: 0, color: '#6c6c80', fontSize: '14px' }}>Будь ласка, оберіть інший день на панелі навігації вище.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const containerStyle = { padding: '40px 8% 80px 8%', backgroundColor: '#0d0d15', minHeight: '100vh', color: '#fff' };
const pageTitleStyle = { fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' };
const subtitleStyle = { color: '#7a7a99', fontSize: '15px', marginBottom: '40px', fontWeight: '500' };
const datePickerContainer = { display: 'flex', gap: '12px', marginBottom: '45px', overflowX: 'auto', paddingBottom: '10px' };
const dateButtonStyle = { padding: '12px 24px', borderRadius: '14px', border: '1px solid', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' };
const moviesListStyle = { display: 'flex', flexDirection: 'column', gap: '24px' };
const movieCardStyle = { display: 'flex', gap: '25px', backgroundColor: '#14141f', borderRadius: '24px', padding: '20px', border: '1px solid', alignItems: 'center', transition: 'all 0.3s ease', flexWrap: 'wrap' };
const posterPlaceholderStyle = { width: '120px', height: '170px', backgroundColor: '#1f1f2e', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 };
const movieInfoStyle = { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' };
const movieTitleStyle = { fontSize: '22px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.5px' };
const ratingBadgeStyle = { backgroundColor: 'rgba(162, 89, 255, 0.12)', color: '#a259ff', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', border: '1px solid rgba(162, 89, 255, 0.2)' };
const movieGenreStyle = { color: '#6c6c80', fontSize: '14px', margin: 0, fontWeight: '500' };
const sessionsContainerStyle = { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' };
const sessionTimeButtonStyle = { padding: '10px 18px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' };
const noSessionsStyle = { textAlign: 'center', padding: '50px 40px', backgroundColor: '#14141f', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.06)', maxWidth: '600px', margin: '40px auto 0 auto' };

export default SchedulePage;