import { useState, useEffect } from 'react';
import axios from 'axios';

const SchedulePage = () => {
  const [movies, setMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Функція для створення рядка дати YYYY-MM-DD
  const formatDateString = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Поточна обрана дата (сьогодні)
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

  // Масив 5 дат для кнопок зверху
  const getDaysArray = () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(formatDateString(d));
    }
    return dates;
  };

  // Отримання дати сеансу у форматі YYYY-MM-DD для фільтрації
  const getSessionDateStr = (showTime) => {
    if (!showTime) return '';
    if (typeof showTime === 'string' && showTime.includes('T')) {
      return showTime.split('T')[0];
    }
    const d = new Date(showTime);
    return isNaN(d.getTime()) ? '' : formatDateString(d);
  };

  // Красиве форматування часу сеансу (наприклад, 18:30)
  const formatSessionTime = (showTime) => {
    if (!showTime) return '--:--';
    const d = new Date(showTime);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC' // Запобігає зсуву годин через часовий пояс
    });
  };

  const formatDateLabel = (dateStr) => {
    const d = new Date(dateStr);
    const months = ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв', 'Лип', 'Серп', 'Верес', 'Жовт', 'Лист', 'Груд'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#8e24aa' }}>Завантаження розкладу...</div>;
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

      {/* 📅 КНОПКИ ДАТ */}
      <div style={datePickerContainer}>
        {getDaysArray().map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            style={{
              ...dateButtonStyle,
              backgroundColor: selectedDate === date ? '#8e24aa' : '#f5f5f5',
              color: selectedDate === date ? '#fff' : '#333',
              boxShadow: selectedDate === date ? '0 4px 12px rgba(142, 36, 170, 0.3)' : 'none'
            }}
          >
            {formatDateLabel(date)}
          </button>
        ))}
      </div>

      {/* 🎬 СПИСОК ФІЛЬМІВ */}
      <div style={moviesListStyle}>
        {movies.map((movie) => {
          const movieSessions = sessions.filter(session => {
            return session.movie_id === movie.id && getSessionDateStr(session.show_time) === selectedDate;
          });

          if (movieSessions.length === 0) return null;

          return (
            <div key={movie.id} style={movieCardStyle}>
              
              {/* Используем твою оригинальную колонку movie.image */}
              {movie.image ? (
                <img 
                  src={movie.image} 
                  alt={movie.title} 
                  style={{
                    width: '120px',
                    height: '170px',
                    objectFit: 'cover',
                    borderRadius: '16px',
                    flexShrink: 0
                  }} 
                />
              ) : (
                <div style={posterPlaceholderStyle}>
                  <span style={{ fontSize: '30px' }}>🎬</span>
                </div>
              )}

              <div style={movieInfoStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={movieTitleStyle}>{movie.title}</h2>
                  <span style={ratingBadgeStyle}>{movie.rating || '16+'}</span>
                </div>
                <p style={movieGenreStyle}>Жанр: {movie.genre}</p>
                

                <div style={sessionsContainerStyle}>
                  {movieSessions.map((session) => (
                    <button 
                      key={session.id} 
                      style={sessionTimeButtonStyle}
                      onClick={() => alert(`Перехід до вибору місць на сеанс ID: ${session.id}`)}
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
          <div style={noSessionsStyle}>🍿 На жаль, на цю дату сеансів більше немає. Оберіть інший день!</div>
        )}
      </div>
    </div>
  );
};

// --- СТИЛІЗАЦІЯ ---
const containerStyle = { padding: '40px 10%', backgroundColor: '#fff', minHeight: '80vh' };
const pageTitleStyle = { fontSize: '32px', fontWeight: '700', color: '#8e24aa', marginBottom: '10px' };
const subtitleStyle = { color: '#666', fontSize: '16px', marginBottom: '30px' };
const datePickerContainer = { display: 'flex', gap: '12px', marginBottom: '40px', overflowX: 'auto', paddingBottom: '10px' };
const dateButtonStyle = { padding: '12px 24px', borderRadius: '14px', border: 'none', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: '0.2s ease' };
const moviesListStyle = { display: 'flex', flexDirection: 'column', gap: '25px' };
const movieCardStyle = { display: 'flex', gap: '25px', backgroundColor: '#fff', borderRadius: '24px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f5f5f5', alignItems: 'center' };
const posterPlaceholderStyle = { width: '120px', height: '170px', backgroundColor: '#f3e5f5', borderRadius: '16px', display: 'flex', justifycontent: 'center', alignItems: 'center', flexShrink: 0 };
const movieInfoStyle = { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' };
const movieTitleStyle = { fontSize: '21px', fontWeight: '700', color: '#333', margin: 0 };
const ratingBadgeStyle = { backgroundColor: '#f3e5f5', color: '#8e24aa', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' };
const movieGenreStyle = { color: '#777', fontSize: '14px', margin: 0 };
const movieDurationStyle = { color: '#999', fontSize: '14px', margin: '0 0 10px 0' };
const sessionsContainerStyle = { display: 'flex', gap: '10px', flexWrap: 'wrap' };
const sessionTimeButtonStyle = { padding: '10px 20px', borderRadius: '10px', border: '1px solid #8e24aa', backgroundColor: '#fff', color: '#8e24aa', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: '0.2s ease' };
const noSessionsStyle = { textAlign: 'center', padding: '40px', color: '#777', backgroundColor: '#f9f9f9', borderRadius: '16px', fontSize: '15px' };

export default SchedulePage;