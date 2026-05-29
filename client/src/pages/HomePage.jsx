import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredMovieId, setHoveredMovieId] = useState(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const bannerSlides = [
    { 
      title: "День Попкорну", 
      subtitle: "Купуй великий попкорн — отримуй напій у подарунок!",
      bg: "linear-gradient(to top, rgba(13, 13, 21, 1), rgba(13, 13, 21, 0.4)), url('https://images.unsplash.com/photo-1578496479531-32e296d5c6e1?w=1200')" 
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 310;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getSessionDateStr = (showTime) => {
    if (!showTime) return '';
    if (typeof showTime === 'string' && showTime.includes('T')) return showTime.split('T')[0];
    const d = new Date(showTime);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const formatSessionTime = (showTime) => {
    if (!showTime) return '--:--';
    const d = new Date(showTime);
    if (isNaN(d.getTime())) return '--:--';
    
    const hasZ = typeof showTime === 'string' && (showTime.endsWith('Z') || showTime.includes('+'));
    return d.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: hasZ ? 'Europe/Kyiv' : 'UTC'
    });
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px', color: '#a259ff', backgroundColor: '#0d0d15', minHeight: '100vh' }}>Завантаження афіші...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={{ ...bannerStyle, backgroundImage: bannerSlides[currentSlide].bg }}>
        <div style={bannerContentWrapperStyle}>
          <h1 style={bannerTitleStyle}>{bannerSlides[currentSlide].title}</h1>
          <p style={bannerSubtitleStyle}>{bannerSlides[currentSlide].subtitle}</p>
          <button style={bannerButtonStyle}>Дізнатись більше</button>
        </div>

        <div style={dotsContainerStyle}>
          {bannerSlides.map((_, index) => (
            <div 
              key={index} 
              style={{
                ...dotStyle,
                backgroundColor: currentSlide === index ? '#a259ff' : 'rgba(255,255,255,0.2)',
                width: currentSlide === index ? '28px' : '8px'
              }}
            />
          ))}
        </div>
      </div>

      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>Зараз у кіно</h2>
        <div style={lineAccentStyle}></div>
      </div>

      <div style={sliderContainerWrapper}>
        <button 
          style={{ ...sideScrollButtonStyle, left: '-20px' }} 
          onClick={() => handleScroll('left')}
          onMouseOver={(e) => { e.target.style.backgroundColor = '#a259ff'; e.target.style.color = '#fff'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(30, 30, 45, 0.8)'; e.target.style.color = '#a259ff'; }}
        >
          ‹
        </button>
        
        <button 
          style={{ ...sideScrollButtonStyle, right: '-20px' }} 
          onClick={() => handleScroll('right')}
          onMouseOver={(e) => { e.target.style.backgroundColor = '#a259ff'; e.target.style.color = '#fff'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = 'rgba(30, 30, 45, 0.8)'; e.target.style.color = '#a259ff'; }}
        >
          ›
        </button>

        <div ref={scrollContainerRef} style={horizontalScrollStyle}>
          {movies.map(movie => {
            const todayMovieSessions = sessions.filter(session => {
              return session.movie_id === movie.id && getSessionDateStr(session.show_time) === todayStr;
            });

            const backupSessions = sessions.filter(session => session.movie_id === movie.id).slice(0, 3);
            const isHovered = hoveredMovieId === movie.id;

            return (
              <div 
                key={movie.id} 
                style={{
                  ...movieCardStyle,
                  transform: isHovered ? 'translateY(-10px)' : 'none',
                  borderColor: isHovered ? 'rgba(162, 89, 255, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                  boxShadow: isHovered ? '0 15px 35px rgba(142, 36, 170, 0.15)' : 'none'
                }}
                onMouseEnter={() => setHoveredMovieId(movie.id)}
                onMouseLeave={() => setHoveredMovieId(null)}
              >
                <div style={imageWrapperStyle}>
                  {movie.image ? (
                    <img 
                      src={movie.image} 
                      alt={movie.title} 
                      style={{
                        ...imageStyle,
                        transform: isHovered ? 'scale(1.06)' : 'scale(1)'
                      }} 
                    />
                  ) : (
                    <div style={posterPlaceholderStyle}>🎬</div>
                  )}
                  <span style={ratingBadgeStyle}>{movie.rating || '16+'}</span>
                </div>
                
                <div style={movieInfoStyle}>
                  <h3 style={movieTitleStyle}>{movie.title}</h3>
                  <p style={movieGenreStyle}>{movie.genre}</p>
                  
                  <div style={sessionsContainerStyle}>
                    {todayMovieSessions.length > 0 ? (
                      todayMovieSessions.map(session => (
                        <button 
                          key={session.id} 
                          style={timeBadgeStyle}
                          onClick={() => navigate(`/session/${session.id}`)}
                          onMouseOver={(e) => { e.target.style.background = 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)'; e.target.style.boxShadow = '0 4px 12px rgba(162, 89, 255, 0.3)'; }}
                          onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.06)'; e.target.style.boxShadow = 'none'; }}
                        >
                          {formatSessionTime(session.show_time)}
                        </button>
                      ))
                    ) : backupSessions.length > 0 ? (
                      backupSessions.map(session => (
                        <button 
                          key={session.id} 
                          style={backupTimeBadgeStyle}
                          onClick={() => navigate(`/session/${session.id}`)}
                          onMouseOver={(e) => { e.target.style.background = 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)'; e.target.style.color = '#fff'; }}
                          onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.02)'; e.target.style.color = '#888'; }}
                        >
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

const containerStyle = { 
  padding: '0 8% 60px 8%', 
  backgroundColor: '#0d0d15', 
  minHeight: '100vh',
  transition: 'all 0.3s ease'
};

const bannerStyle = {
  backgroundSize: 'cover', 
  backgroundPosition: 'center', 
  borderRadius: '32px', 
  padding: '60px 50px',
  color: '#fff', 
  marginBottom: '50px', 
  position: 'relative',
  minHeight: '320px', 
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'center', 
  alignItems: 'flex-start',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  transition: 'background-image 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
};

const bannerContentWrapperStyle = {
  maxWidth: '550px',
  textAlign: 'left',
  zIndex: 2
};

const bannerTitleStyle = { 
  fontSize: '46px', 
  fontWeight: '900', 
  margin: '0 0 12px 0', 
  letterSpacing: '-1px',
  lineHeight: '1.1'
};

const bannerSubtitleStyle = { 
  fontSize: '16px', 
  margin: '0 0 28px 0', 
  opacity: 0.85, 
  lineHeight: '1.5' 
};

const bannerButtonStyle = { 
  padding: '14px 36px', 
  background: 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)', 
  color: '#fff', 
  border: 'none', 
  borderRadius: '14px', 
  fontSize: '14px', 
  fontWeight: '700', 
  cursor: 'pointer', 
  boxShadow: '0 6px 20px rgba(162, 89, 255, 0.4)'
};

const dotsContainerStyle = { position: 'absolute', bottom: '25px', right: '50px', display: 'flex', gap: '8px' };
const dotStyle = { height: '8px', borderRadius: '4px', transition: 'all 0.4s ease' };

const sectionHeaderStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginBottom: '30px'
};

const sectionTitleStyle = { 
  fontSize: '28px', 
  fontWeight: '800', 
  color: '#fff', 
  margin: 0,
  letterSpacing: '-0.5px'
};

const lineAccentStyle = {
  width: '60px',
  height: '4px',
  background: 'linear-gradient(90deg, #a259ff, #2b3abf)',
  borderRadius: '2px'
};

const sliderContainerWrapper = { 
  position: 'relative', 
  width: '100%',
  display: 'block' 
};

const sideScrollButtonStyle = {
  position: 'absolute', 
  top: '180px', 
  width: '48px', 
  height: '48px', 
  borderRadius: '50%',
  backgroundColor: 'rgba(30, 30, 45, 0.8)', 
  backdropFilter: 'blur(10px)',
  color: '#a259ff', 
  border: '1px solid rgba(162, 89, 255, 0.2)', 
  fontSize: '26px',
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  cursor: 'pointer', 
  zIndex: 15,
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)', 
  transition: 'all 0.2s ease', 
  paddingBottom: '4px'
};

const horizontalScrollStyle = {
  display: 'flex', 
  gap: '30px', 
  overflowX: 'auto', 
  paddingBottom: '25px',
  scrollBehavior: 'smooth', 
  scrollbarWidth: 'none', 
  msOverflowStyle: 'none',
  width: '100%'
};

const movieCardStyle = { 
  width: '280px', 
  flexShrink: 0, 
  display: 'flex', 
  flexDirection: 'column',
  backgroundColor: '#14141f',
  borderRadius: '24px',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
};

const imageWrapperStyle = {
  position: 'relative',
  width: '280px',
  height: '400px',
  overflow: 'hidden'
};

const imageStyle = { 
  width: '100%', 
  height: '100%', 
  objectFit: 'cover',
  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
};

const posterPlaceholderStyle = { 
  width: '100%', 
  height: '100%', 
  backgroundColor: '#1f1f2e', 
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  fontSize: '40px' 
};

const ratingBadgeStyle = { 
  position: 'absolute',
  top: '15px',
  right: '15px',
  backgroundColor: 'rgba(13, 13, 21, 0.75)', 
  backdropFilter: 'blur(6px)',
  color: '#a259ff', 
  padding: '4px 10px', 
  borderRadius: '8px', 
  fontSize: '12px', 
  fontWeight: '800',
  border: '1px solid rgba(162, 89, 255, 0.3)'
};

const movieInfoStyle = { 
  padding: '20px',
  display: 'flex', 
  flexDirection: 'column', 
  gap: '6px'
};

const movieTitleStyle = { 
  fontSize: '18px', 
  fontWeight: '700', 
  color: '#fff', 
  margin: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const movieGenreStyle = { color: '#6c6c80', fontSize: '13px', margin: 0, fontWeight: '500' };

const sessionsContainerStyle = { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' };

const timeBadgeStyle = { 
  padding: '8px 14px', 
  backgroundColor: 'rgba(255, 255, 255, 0.06)', 
  color: '#fff', 
  borderRadius: '10px', 
  fontSize: '13px', 
  fontWeight: '700',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const backupTimeBadgeStyle = {
  padding: '8px 14px', 
  backgroundColor: 'rgba(255, 255, 255, 0.02)', 
  color: '#888', 
  borderRadius: '10px', 
  fontSize: '13px', 
  fontWeight: '600',
  border: '1px solid rgba(255, 255, 255, 0.03)',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const noSessionsTextStyle = { fontSize: '13px', color: '#525266', fontStyle: 'italic', marginTop: '5px' };

export default HomePage;