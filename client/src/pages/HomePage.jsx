import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef(null);

  // Отримуємо сьогоднішню дату в локальному форматі YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Слайди для твого красивого банера
  const bannerSlides = [
    { 
      title: "День Попкорну", 
      subtitle: "Купуй великий попкорн — отримуй напій у подарунок!",
      bg: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1578496479531-32e296d5c6e1?w=1200')" 
    },
    { 
      title: "Cinema Future", 
      subtitle: "Відчуй майбутнє кіно в ТРЦ «Подоляни»",
      bg: "linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const moviesResponse = await axios.get('http://localhost:5000/api/movies');
        const sessionsResponse = await axios.get('http://localhost:5000/api/sessions');
        
        setMovies(Array.isArray(moviesResponse.data) ? moviesResponse.data : []);
        setSessions(Array.isArray(sessionsResponse.data) ? sessionsResponse.data : []);
      } catch (error) {
        console.error("Помилка завантаження даних для головної сторінки:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Перемикання банерів
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // Функція для плавного скролу стрічки вліво/вправо
  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 310; // Ширина картки + відступ
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Парсинг дати з UTC/Рядка до YYYY-MM-DD
  const getSessionDateStr = (showTime) => {
    if (!showTime) return '';
    if (typeof showTime === 'string' && showTime.includes('T')) return showTime.split('T')[0];
    const d = new Date(showTime);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  // Перетворення часу в формат HH:MM (з урахуванням можливого зсуву зон)
  const formatSessionTime = (showTime) => {
    if (!showTime) return '--:--';
    const d = new Date(showTime);
    if (isNaN(d.getTime())) return '--:--';
    
    // Перевіряємо, чи є в рядку суфікс 'Z' (UTC з бази)
    const hasZ = typeof showTime === 'string' && (showTime.endsWith('Z') || showTime.includes('+'));
    return d.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: hasZ ? 'Europe/Kyiv' : 'UTC'
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#8e24aa' }}>Завантаження афіші...</div>;
  }

  return (
    <div style={containerStyle}>
      
      {/* 🍿 ІНТЕНСИВНИЙ БАНЕР З КНОПКОЮ */}
      <div style={{ ...bannerStyle, backgroundImage: bannerSlides[currentSlide].bg }}>
        <h1 style={bannerTitleStyle}>{bannerSlides[currentSlide].title}</h1>
        <p style={bannerSubtitleStyle}>{bannerSlides[currentSlide].subtitle}</p>
        <button style={bannerButtonStyle}>Дізнатись більше</button>

        <div style={dotsContainerStyle}>
          {bannerSlides.map((_, index) => (
            <div 
              key={index} 
              style={{
                ...dotStyle,
                backgroundColor: currentSlide === index ? '#fff' : 'rgba(255,255,255,0.4)',
                width: currentSlide === index ? '24px' : '8px'
              }}
            />
          ))}
        </div>
      </div>

      <h2 style={sectionTitleStyle}>Зараз у кіно</h2>

      {/* 🎬 ОБГОРТКА ДЛЯ СКРОЛУ (КНОПКИ ТЕПЕР ПРАВИЛЬНО ПО БОКАХ) */}
      <div style={sliderContainerWrapper}>
        
        {/* Ліва стрічка поверх картки */}
        <button 
          style={{ ...sideScrollButtonStyle, left: '-25px' }} 
          onClick={() => handleScroll('left')}
          title="Назад"
        >
          ‹
        </button>
        
        {/* Права стрічка поверх картки */}
        <button 
          style={{ ...sideScrollButtonStyle, right: '-25px' }} 
          onClick={() => handleScroll('right')}
          title="Вперед"
        >
          ›
        </button>

        {/* Стрічка з горизонтальною прокруткою */}
        <div ref={scrollContainerRef} style={horizontalScrollStyle}>
          {movies.map(movie => {
            // Фільтруємо сеанси саме для цього фільму на поточний день
            const todayMovieSessions = sessions.filter(session => {
              return session.movie_id === movie.id && getSessionDateStr(session.show_time) === todayStr;
            });

            // Якщо на сьогодні немає, беремо взагалі будь-які сеанси фільму, щоб показати хоч якийсь розклад
            const backupSessions = sessions.filter(session => session.movie_id === movie.id).slice(0, 3);

            return (
              <div key={movie.id} style={movieCardStyle}>
                {movie.image ? (
                  <img src={movie.image} alt={movie.title} style={imageStyle} />
                ) : (
                  <div style={posterPlaceholderStyle}>🎬</div>
                )}
                
                <div style={movieInfoStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <h3 style={movieTitleStyle}>{movie.title}</h3>
                    <span style={ratingBadgeStyle}>{movie.rating || '16+'}</span>
                  </div>
                  <p style={movieGenreStyle}>{movie.genre}</p>
                  
                  {/* РОЗКЛАД СЕАНСІВ (КНОПКИ ЧАСУ) */}
                  <div style={sessionsContainerStyle}>
                    {todayMovieSessions.length > 0 ? (
                      todayMovieSessions.map(session => (
                        <button key={session.id} style={timeBadgeStyle}>
                          {formatSessionTime(session.show_time)}
                        </button>
                      ))
                    ) : backupSessions.length > 0 ? (
                      // Якщо сеанси є на інші дні
                      backupSessions.map(session => (
                        <button key={session.id} style={{ ...timeBadgeStyle, backgroundColor: '#f5f5f5', color: '#666', borderColor: '#ddd' }}>
                          {formatSessionTime(session.show_time)}
                        </button>
                      ))
                    ) : (
                      <span style={noSessionsTextStyle}>Сеансів немає</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- СТИЛІЗАЦІЯ (ПОВНА ВИПРАВКА СКРОЛУ ТА ПОЗИЦІОНУВАННЯ) ---
const containerStyle = { padding: '0 8% 40px 8%', backgroundColor: '#fff', minHeight: '100vh' };

const bannerStyle = {
  backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '24px', padding: '50px 40px',
  color: '#fff', marginBottom: '40px', boxShadow: '0 12px 30px rgba(0,0,0,0.08)', position: 'relative',
  minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  textAlign: 'center', transition: 'background-image 0.8s ease'
};

const bannerTitleStyle = { fontSize: '38px', fontWeight: '800', margin: '0 0 10px 0', textShadow: '0 2px 4px rgba(0,0,0,0.4)' };
const bannerSubtitleStyle = { fontSize: '16px', margin: '0 0 20px 0', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.4)' };
const bannerButtonStyle = { padding: '12px 32px', backgroundColor: '#8e24aa', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(142,36,170,0.4)' };
const dotsContainerStyle = { position: 'absolute', bottom: '20px', display: 'flex', gap: '8px' };
const dotStyle = { height: '8px', borderRadius: '4px', transition: 'all 0.3s ease' };

const sectionTitleStyle = { fontSize: '26px', fontWeight: '700', color: '#333', marginBottom: '20px' };

// ГОЛОВНЕ ВИПРАВЛЕННЯ: Контейнер-обгортка з відносним позиціонуванням
const sliderContainerWrapper = { 
  position: 'relative', 
  width: '100%',
  display: 'block' 
};

// Стрілки тепер літають поверх списку завдяки position: 'absolute'
const sideScrollButtonStyle = {
  position: 'absolute', 
  top: '180px', // Вирівняно приблизно по центру постерів
  width: '46px', 
  height: '46px', 
  borderRadius: '50%',
  backgroundColor: '#fff', 
  color: '#8e24aa', 
  border: '1px solid #e0e0e0', 
  fontSize: '28px',
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  cursor: 'pointer', 
  zIndex: 15,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
  transition: 'all 0.2s ease', 
  paddingBottom: '4px'
};

// Рядок фільмів, що йде строго в лінію
const horizontalScrollStyle = {
  display: 'flex', 
  gap: '30px', 
  overflowX: 'auto', 
  paddingBottom: '20px',
  scrollBehavior: 'smooth', 
  scrollbarWidth: 'none', 
  msOverflowStyle: 'none',
  width: '100%'
};

const movieCardStyle = { width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column' };
const imageStyle = { width: '280px', height: '420px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)' };
const posterPlaceholderStyle = { width: '280px', height: '420px', backgroundColor: '#f3e5f5', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px' };

const movieInfoStyle = { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 };
const movieTitleStyle = { fontSize: '18px', fontWeight: '700', color: '#333', margin: 0 };
const ratingBadgeStyle = { backgroundColor: '#f3e5f5', color: '#8e24aa', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' };
const movieGenreStyle = { color: '#777', fontSize: '13px', margin: 0 };

const sessionsContainerStyle = { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' };

// Кнопка-таймслот для сеансу
const timeBadgeStyle = { 
  padding: '8px 14px', 
  backgroundColor: '#f3e5f5', 
  color: '#4a148c', 
  borderRadius: '10px', 
  fontSize: '13px', 
  fontWeight: '600',
  border: '1px solid rgba(142, 36, 170, 0.15)',
  cursor: 'pointer'
};

const noSessionsTextStyle = { fontSize: '13px', color: '#999', fontStyle: 'italic', marginTop: '5px' };

export default HomePage;