import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState, createContext } from 'react';
import axios from 'axios';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage'; // Додано імпорт сторінки профілю

// 1. Створюємо контекст авторизації прямо тут
export const AuthContext = createContext();

function App() {
  const [movies, setMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null); // Стан користувача (null = не увійшов)

  // Завантаження фільмів та сеансів
  useEffect(() => {
    axios.get('http://localhost:5000/api/movies')
      .then(res => setMovies(res.data))
      .catch(err => console.error("Помилка завантаження фільмів:", err));

    axios.get('http://localhost:5000/api/sessions')
      .then(res => setSessions(res.data))
      .catch(err => console.error("Помилка завантаження сеансів:", err));
    
    // Перевірка, чи є збережений користувач у localStorage
    const savedUser = localStorage.getItem('cinema_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Функції для входу та виходу
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('cinema_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cinema_user');
  };

  const promoAds = [
    {
      id: 1,
      title: "Мандалорець",
      desc: "Новий сезон вже у продажу — обирайте найкращі місця!",
      img: "https://i.pinimg.com/1200x/f8/48/a3/f848a30a2401a4e917ab0b73c2b90a94.jpg",
      btnText: "Придбати квиток"
    },
    {
      id: 2,
      title: "День Попкорну",
      desc: "Купуй великий попкорн — отримуй напій у подарунок!",
      img: "https://i.pinimg.com/1200x/00/40/d2/0040d2818124e6c637f00ea22877680b.jpg",
      btnText: "Дізнатись більше"
    },
    {
      id: 3,
      title: "Cinema Club",
      desc: "Знижка 20% на вечірні сеанси для студентів IT",
      img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070",
      btnText: "Стати учасником"
    }
  ];

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
          <Header />
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  movies={movies} 
                  sessions={sessions} 
                  promoAds={promoAds} 
                />
              } 
            />
            <Route 
              path="/schedule" 
              element={<SchedulePage />} 
            />
            <Route 
              path="/auth" 
              element={<AuthPage />} 
            />
            {/* 🎉 НОВИЙ РОУТ ДЛЯ ОСОБИСТОГО КАБІНЕТУ */}
            <Route 
              path="/profile" 
              element={<ProfilePage />} 
            />
          </Routes>
          <footer style={{ height: '60px', marginTop: 'auto' }}></footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;