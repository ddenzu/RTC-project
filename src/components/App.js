import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import '../App.css';
import Room from './room.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from 'react-query';
import { PasswordModal } from './modal.js';
import { fetchRoomList, checkRoomPassword } from '../utils/dataHandler.js';

const App = () => {
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [tempRoomName, setTempRoomName] = useState('');
  const navigate = useNavigate(); 
  const { data: roomList, isLoading } = useQuery('roomList', fetchRoomList);

  const makeNewRoom = async () => {
    if (!roomName || !roomPassword) {
      alert(!roomName ? '방 제목을 지정해 주세요.' : '비밀번호를 지정해 주세요.');
      return;
    }
    navigate('/room', { state: { roomName, roomPassword } });
  };

  const chooseRoom = (roomName) => { // 비밀번호 입력 전
    setTempRoomName(roomName);
    setModalIsOpen(true);
  };

  const handleRoomJoin = async () => { // 비밀번호 입력 후
    try {
      const verifyPassword = await checkRoomPassword(tempRoomName, roomPassword);
      if (verifyPassword) {
        setModalIsOpen(false);
        navigate('/room', { state: { roomName: tempRoomName, roomPassword } });
      } else {
        alert('비밀번호가 틀렸습니다.');
        setRoomPassword(''); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const closeButton = () => {
    setModalIsOpen(false);
    setRoomPassword(''); 
  };

  return (
    <>
    <Routes>
      <Route path='/' element={
        <>
          <div className='roomList'>
            <h1>WebSocket Chat</h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '5px' }}>
                  <input
                    className='roomTitleInput'
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="방제목 설정"
                  />
                  <input
                    className='roomTitleInput'
                    style={{ marginBottom: '0px' }}
                    type="password"
                    value={roomPassword}
                    onChange={(e) => setRoomPassword(e.target.value)}
                    placeholder="비밀번호 설정"
                  />
                </div>
                <button style={{ padding: '5px', height: '65px' }} onClick={makeNewRoom}>NewRoom</button>
              </div>
            </div>
            <h2>- Room List -</h2>
            {isLoading ? (
              <h4>
                <FontAwesomeIcon icon={faSpinner} spin /> Loading...
              </h4>
            ) : (
              roomList && Object.keys(roomList).map((key, index) => (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '7px' }} key={index}>
                  방제: {key}, 참가자: {roomList[key].count} 명
                  <button style={{ marginLeft: '15px' }} onClick={() => chooseRoom(key)}>Join</button>
                </div>
              ))
            )}
          </div>
          <footer className='foot'>
            ⓒ 2024.<br />✔ Contact<br />eogks999@naver.com
          </footer>
        </>
      } />
      <Route path='/room' element={<Room />} />
    </Routes>
    <PasswordModal
      modalIsOpen={modalIsOpen}
      closeButton={closeButton}
      roomPassword={roomPassword}
      setRoomPassword={setRoomPassword}
      joinButton={handleRoomJoin}
    />
  </>
  );
};

export default App;