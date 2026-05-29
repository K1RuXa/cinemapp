import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';

const HallPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [takenSeats, setTakenSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const currentUserData = user?.user || user;
  const userId = currentUserData?.id;

  const rowsConfig = [
    { rowNum: 1, type: 'econom', color: '#ff9100', glow: 'rgba(255,145,0,0.4)', seatsCount: 16, price: 120 },
    { rowNum: 2, type: 'econom', color: '#ff9100', glow: 'rgba(255,145,0,0.4)', seatsCount: 16, price: 120 },
    { rowNum: 3, type: 'comfort', color: '#ffea00', glow: 'rgba(255,234,0,0.4)', seatsCount: 16, price: 160 },
    { rowNum: 4, type: 'comfort', color: '#ffea00', glow: 'rgba(255,234,0,0.4)', seatsCount: 16, price: 160 },
    { rowNum: 5, type: 'premium', color: '#00e676', glow: 'rgba(0,230,118,0.4)', seatsCount: 16, price: 200 },
    { rowNum: 6, type: 'premium', color: '#00e676', glow: 'rgba(0,230,118,0.4)', seatsCount: 16, price: 200 },
    { rowNum: 7, type: 'vip', color: '#d500f9', glow: 'rgba(213,0,249,0.4)', seatsCount: 8, price: 300, isVip: true },
  ];

  useEffect(() => {
    const fetchTakenSeats = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sessions/${sessionId}/taken-seats`);
        const seatsStrings = res.data.map(ticket => ticket.seat_details);
        setTakenSeats(seatsStrings);
      } catch (err) {
        console.error("Помилка завантаження зайнятих місць:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTakenSeats();
  }, [sessionId, bookingSuccess]);

  const handleSeatClick = (rowNum, seatNum, price) => {
    const seatKey = `Ряд ${rowNum} | Місце ${seatNum}`;
    if (selectedSeats.some(s => s.key === seatKey)) {
      setSelectedSeats(selectedSeats.filter(s => s.key !== seatKey));
    } else {
      setSelectedSeats([...selectedSeats, { key: seatKey, price }]);
    }
  };

  const calculateTotal = () => selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleBuyTickets = async () => {
    if (!userId) {
      alert("Будь ласка, увійдіть в акаунт перед купівлей квитків!");
      navigate('/auth');
      return;
    }

    try {
      const seatsData = selectedSeats.map(s => s.key);
      const totalAmount = calculateTotal();

      await axios.post('http://localhost:5000/api/booking/book', {
        userId,
        sessionId,
        seats: seatsData,
        totalAmount
      });

      setBookingSuccess(true);
      setSelectedSeats([]);
    } catch (err) {
      console.error("Помилка при бронюванні квитків:", err);
      alert("Не вдалося оформити квитки. Спробуйте ще раз.");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', color: '#a259ff', backgroundColor: '#0d0d15', minHeight: '100vh', fontSize: '18px', fontWeight: '600' }}>Завантаження схеми залу...</div>;

  return (
    <div style={containerStyle}>
      <div style={topBarStyle}>
        <button style={backBtnStyle} onClick={() => navigate(-1)}>‹ Назад до афіші</button>
        <h2 style={titleStyle}>Вибір місць на сеанс</h2>
      </div>
      
      <div style={hallCinemaStyle}>
        <div style={screenWrapperStyle}>
          <div style={screenStyle}></div>
          <div style={screenGlowStyle}>ЕКРАН</div>
        </div>

        <div style={seatingContainer}>
          {rowsConfig.map((row) => {
            const leftSeats = Array.from({ length: row.isVip ? 4 : 8 }, (_, i) => i + 1);
            const rightSeats = Array.from({ length: row.isVip ? 4 : 8 }, (_, i) => i + (row.isVip ? 5 : 9));

            return (
              <div key={row.rowNum} style={rowStyle}>
                <span style={rowLabelStyle}>Ряд {row.rowNum}</span>
                
                <div style={sectionSeatsStyle}>
                  {leftSeats.map(seatNum => {
                    const seatId = `Ряд ${row.rowNum} | Місце ${seatNum}`;
                    const isTaken = takenSeats.some(ts => ts.includes(`Ряд ${row.rowNum}`) && ts.includes(`Місце ${seatNum}`));
                    const isSelected = selectedSeats.some(s => s.key === seatId);

                    return (
                      <button
                        key={seatNum}
                        disabled={isTaken}
                        onClick={() => handleSeatClick(row.rowNum, seatNum, row.price)}
                        style={{
                          ...seatStyle,
                          backgroundColor: isTaken ? '#222230' : isSelected ? '#fff' : row.color,
                          color: isTaken ? '#44445c' : isSelected ? '#0d0d15' : '#0d0d15',
                          boxShadow: isTaken ? 'none' : isSelected ? '0 0 20px #fff' : `0 4px 12px ${row.glow}`,
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                          width: row.isVip ? '48px' : '34px',
                          height: '34px',
                          transform: isSelected ? 'scale(1.1)' : 'none',
                          border: isSelected ? '2px solid #fff' : 'none',
                          opacity: isTaken ? 0.25 : 1
                        }}
                      >
                        {isTaken ? '×' : seatNum}
                      </button>
                    );
                  })}
                </div>

                <div style={aisleStyle}>{row.rowNum === 4 && '🚪'}</div>

                <div style={sectionSeatsStyle}>
                  {rightSeats.map(seatNum => {
                    const seatId = `Ряд ${row.rowNum} | Місце ${seatNum}`;
                    const isTaken = takenSeats.some(ts => ts.includes(`Ряд ${row.rowNum}`) && ts.includes(`Місце ${seatNum}`));
                    const isSelected = selectedSeats.some(s => s.key === seatId);

                    return (
                      <button
                        key={seatNum}
                        disabled={isTaken}
                        onClick={() => handleSeatClick(row.rowNum, seatNum, row.price)}
                        style={{
                          ...seatStyle,
                          backgroundColor: isTaken ? '#222230' : isSelected ? '#fff' : row.color,
                          color: isTaken ? '#44445c' : isSelected ? '#0d0d15' : '#0d0d15',
                          boxShadow: isTaken ? 'none' : isSelected ? '0 0 20px #fff' : `0 4px 12px ${row.glow}`,
                          cursor: isTaken ? 'not-allowed' : 'pointer',
                          width: row.isVip ? '48px' : '34px',
                          height: '34px',
                          transform: isSelected ? 'scale(1.1)' : 'none',
                          border: isSelected ? '2px solid #fff' : 'none',
                          opacity: isTaken ? 0.25 : 1
                        }}
                      >
                        {isTaken ? '×' : seatNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={legendContainerStyle}>
          <div style={legendItemStyle}><div style={{...legendCircleStyle, backgroundColor: '#ff9100'}}></div> Економ</div>
          <div style={legendItemStyle}><div style={{...legendCircleStyle, backgroundColor: '#ffea00'}}></div> Комфорт</div>
          <div style={legendItemStyle}><div style={{...legendCircleStyle, backgroundColor: '#00e676'}}></div> Преміум</div>
          <div style={legendItemStyle}><div style={{...legendCircleStyle, backgroundColor: '#d500f9'}}></div> VIP Люкс</div>
          <div style={legendItemStyle}><div style={{...legendCircleStyle, backgroundColor: '#222230', opacity: 0.5}}></div> Зайнято</div>
        </div>
      </div>

      <div style={checkoutPanelStyle}>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6c6c80', fontWeight: '600' }}>Обрані місця:</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#fff' }}>
            {selectedSeats.length > 0 ? selectedSeats.map(s => s.key.replace('Ряд ', 'Р').replace(' | Місце ', 'М')).join(', ') : 'Не обрано'}
          </p>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '30px' }}>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#a259ff', letterSpacing: '-0.5px' }}>{calculateTotal()} грн</p>
          <button 
            disabled={selectedSeats.length === 0}
            style={{ 
              ...buyButtonStyle, 
              opacity: selectedSeats.length === 0 ? 0.3 : 1,
              cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)',
              boxShadow: selectedSeats.length === 0 ? 'none' : '0 6px 20px rgba(162, 89, 255, 0.4)'
            }}
            onClick={handleBuyTickets}
          >
            Купити квитки
          </button>
        </div>
      </div>

      {bookingSuccess && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={successIconStyle}>✓</div>
            <h3 style={modalTitleStyle}>Оплата успішна!</h3>
            <p style={modalTextStyle}>Ваші квитки успішно згенеровані та додані до вашого профілю.</p>
            <div style={modalButtonsContainer}>
              <button style={goToProfileBtnStyle} onClick={() => navigate('/profile')}>Перейти в Профіль 🎟</button>
              <button style={closeModalBtnStyle} onClick={() => setBookingSuccess(false)}>Закрити</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle = { padding: '0 8% 60px 8%', backgroundColor: '#0d0d15', minHeight: '100vh', color: '#fff', position: 'relative' };
const topBarStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 0 20px 0' };
const backBtnStyle = { background: 'none', border: 'none', color: '#a259ff', fontSize: '15px', fontWeight: '700', cursor: 'pointer' };
const titleStyle = { fontSize: '22px', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '-0.3px' };

const hallCinemaStyle = { 
  background: '#14141f', 
  padding: '50px 40px 30px 40px', borderRadius: '32px', display: 'block', 
  border: '1px solid rgba(255,255,255,0.04)', width: '100%', boxSizing: 'border-box'
};

const screenWrapperStyle = { position: 'relative', width: '70%', margin: '0 auto 60px auto', textAlign: 'center' };
const screenStyle = { width: '100%', height: '6px', backgroundColor: '#a259ff', borderRadius: '50%', boxShadow: '0 -4px 30px #a259ff, 0 4px 30px #a259ff' };
const screenGlowStyle = { marginTop: '15px', color: 'rgba(162, 89, 255, 0.4)', fontSize: '12px', fontWeight: '800', letterSpacing: '4px' };
const seatingContainer = { display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' };
const rowStyle = { display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' };
const rowLabelStyle = { width: '70px', textAlign: 'left', fontSize: '13px', color: '#525266', fontWeight: '700' };
const sectionSeatsStyle = { display: 'flex', gap: '8px' };
const aisleStyle = { width: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px', opacity: 0.7 };
const seatStyle = { borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' };
const legendContainerStyle = { display: 'flex', justifyContent: 'center', gap: '25px', marginTop: '45px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' };
const legendItemStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6c6c80', fontWeight: '600' };
const legendCircleStyle = { width: '12px', height: '12px', borderRadius: '4px' };

const checkoutPanelStyle = { 
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
  backgroundColor: '#14141f', padding: '24px 40px', borderRadius: '24px', 
  marginTop: '30px', border: '1px solid rgba(255, 255, 255, 0.04)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)' 
};
const buyButtonStyle = { padding: '14px 35px', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', transition: 'all 0.2s ease' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(11, 11, 16, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' };
const modalContentStyle = { backgroundColor: '#14141f', padding: '40px', borderRadius: '32px', textAlign: 'center', maxWidth: '420px', width: '90%', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' };
const successIconStyle = { width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#00e676', color: '#fff', fontSize: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0, 230, 118, 0.3)' };
const modalTitleStyle = { fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 10px 0' };
const modalTextStyle = { fontSize: '15px', color: '#6c6c80', margin: '0 0 30px 0', lineHeight: '1.5', fontWeight: '500' };
const modalButtonsContainer = { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' };
const goToProfileBtnStyle = { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2b3abf 0%, #a259ff 100%)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(162, 89, 255, 0.3)' };
const closeModalBtnStyle = { width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#525266', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'color 0.2s ease' };

export default HallPage;