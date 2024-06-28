import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Room from './room.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useQuery } from 'react-query';
import Modal from 'react-modal';

const App = () => {
  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [tempRoomName, setTempRoomName] = useState('');
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동 처리
  
  const { data: roomList, isLoading, isError } = useQuery('작명', async () => {
    const response = await fetch('http://192.168.219.106:8080/data');
    if (!response.ok) { 
      throw new Error('방목록 가져오기 실패');
    }
    return response.json();
  })

  useEffect(() => {
    console.log(roomList)
  }, [roomList])

  const handleButtonClick = async () => {
    try {
      if (!roomName) {
        alert('방 제목을 지정해 주세요.');
        return;
      }
      if (!roomPassword) {
        alert('비밀번호를 지정해 주세요.');
        return;
      }
      return navigate('/room', { state: { roomName, roomPassword } });
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinRoom = (roomName) => {
    setTempRoomName(roomName);
    setModalIsOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const response = await fetch('http://192.168.219.106:8080/checkPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName: tempRoomName, roomPassword }),
      });
  
      const data = await response.json();
  
      if (data.success) {
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

  const handleModalClose = () => {
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
                <button style={{ padding: '5px', height: '65px' }} onClick={handleButtonClick}>NewRoom</button>
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
                  <button style={{ marginLeft: '15px' }} onClick={() => handleJoinRoom(key)}>Join</button>
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
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={handleModalClose}
      className="modal-content"
      overlayClassName="modal-overlay"
      contentLabel="비밀번호 입력"
      ariaHideApp={false}
    >
    <h2 style={{ display: 'flex', justifyContent: 'center' }}>PASSWORD</h2>
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <input
      style={{outline: 'none'}}
        type="password"
        value={roomPassword}
        onChange={(e) => setRoomPassword(e.target.value)}
      />
      <button className='modal-button-submit modal-button' onClick={handleModalSubmit}>Join</button>
      <button className='modal-button-cancel modal-button' onClick={handleModalClose}>Cancel</button>
    </div>
    </Modal>
  </>
  );
};

export default App;