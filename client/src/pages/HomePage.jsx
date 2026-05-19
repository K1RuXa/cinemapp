import { useState, useEffect, useRef } from 'react';
import '../index.css';

const HomePage = ({ movies = [], sessions = [], promoAds = [] }) => {
  const [currentAd, setCurrentAd] = useState(0);
  const scrollRef = useRef(null);

  // Автоматичне перемикання рекламного банера кожні 5 секунд
  useEffect(() => {
    if (promoAds.length > 0) {
      const timer = setInterval(() => {
        setCurrentAd((prev) => (prev + 1) % promoAds.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [promoAds.length]);

  // Функція для плавного скролу секції з фільмами
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      const scrollAmount = 700; 
      direction === 'left' 
        ? (current.scrollLeft -= scrollAmount) 
        : (current.scrollLeft += scrollAmount);
    }
  };

  return (
    <div className="app-wrapper">
      {/* --- СЕКЦІЯ РЕКЛАМНОГО БАНЕРА --- */}
      <section className="promo-section">
        <div className="promo-viewport">
          {promoAds.map((ad, index) => (
            <div 
              key={ad.id} 
              className={`promo-slide ${index === currentAd ? 'active' : ''}`}
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${ad.img})` 
              }}
            >
              <h1>{ad.title}</h1>
              <p>{ad.desc}</p>
              <button className="promo-btn">{ad.btnText}</button>
            </div>
          ))}
          <div className="promo-dots">
            {promoAds.map((_, index) => (
              <div 
                key={index} 
                className={`dot ${index === currentAd ? 'active' : ''}`} 
                onClick={() => setCurrentAd(index)} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- ОСНОВНА СЕКЦІЯ З ФІЛЬМАМИ --- */}
      <main style={{ padding: '40px 10%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>Сьогодні в кіно:</h2>
          <span style={{ color: '#8e24aa', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>Дивитися всі</span>
        </div>

        <div className="movie-container" style={{ position: 'relative' }}>
          {/* Кнопки навігації (винесені за межі карток) */}
          <button 
            className="nav-btn prev-btn" 
            onClick={() => scroll('left')} 
            style={{ left: '-65px' }}
          >
            ❮
          </button>
          <button 
            className="nav-btn next-btn" 
            onClick={() => scroll('right')} 
            style={{ right: '-65px' }}
          >
            ❯
          </button>

          <div className="movie-slider" ref={scrollRef}>
            {movies.map(movie => (
              <div key={movie.id} className="movie-card" style={{ flex: '0 0 300px' }}>
                {/* Постер фільму */}
                <div 
                  className="movie-poster" 
                  style={{ 
                    backgroundImage: `url(${movie.image})`, 
                    height: '420px', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    borderRadius: '24px',
                    position: 'relative',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Покращений рейтинг (Glassmorphism) у верхньому правому куті */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '15px', 
                    right: '15px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    color: '#fff', 
                    padding: '6px 12px', 
                    borderRadius: '12px', 
                    fontSize: '14px', 
                    fontWeight: '700',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    ⭐ {movie.rating || '0.0'}
                  </div>
                </div>

                <h3 style={{ fontSize: '19px', margin: '15px 0 5px 0', fontWeight: '700' }}>{movie.title}</h3>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>{movie.genre || 'Бойовик'}</p>
                
                {/* Список сеансів (відсортований за часом) */}
                <div className="sessions-list" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {sessions
                    .filter(s => s.movie_id === movie.id)
                    .sort((a, b) => a.show_time.localeCompare(b.show_time)) // Сортування часу за порядком
                    .map(s => (
                      <button 
                        key={s.id} 
                        className="session-time-btn"
                        style={{
                          padding: '7px 12px',
                          borderRadius: '10px',
                          border: '1px solid #eee',
                          backgroundColor: '#f8f8f8',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: '0.2s'
                        }}
                      >
                        {s.show_time}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Нижній відступ для естетики */}
      <div style={{ height: '60px' }}></div>
    </div>
  );
};

export default HomePage;