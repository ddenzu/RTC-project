import React from 'react';
import { Route, Routes } from 'react-router-dom';
import '../App.css';
import Room from './room.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { PasswordModal } from '../components/modals/passwordModal.js';
import { useEntrance } from '../hooks/useEntrance.js'

const App = () => {
  const {
    roomName,
    setRoomName,
    roomPassword,
    setRoomPassword,
    modalIsOpen,
    roomList,
    isLoading,
    makeNewRoom,
    chooseRoom,
    handleRoomJoin,
    closeButton
  } = useEntrance();

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