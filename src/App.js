import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Room from './room.js';
import io from "socket.io-client";

const App = () => {
  const [roomName, setRoomName] = useState('');
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate(); // useNavigate 훅을 사용하여 페이지 이동 처리
  // const socket = io("http://localhost:8080");

  const handleButtonClick = async () => {
    try {
      if (!roomName) {
        alert('방 제목을 지정해 주세요.');
        return;
      }
      // const response = await fetch('http://localhost:8080/create-room', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ roomName }),
      // });
      // if (response.ok) {
      //   const data = await response.json();
      //   if (data === '이미 존재하는 방 제목') {
      //     alert('이미 존재하는 방 제목 입니다.');
      //     setRoomName('');
      //   } else {
      //     console.log(data)
      //     return navigate('/room', { state: { roomName, roomNumber } });
      //   }
      // } else {
      //   throw new Error('서버 응답 오류');
      // }
      return navigate('/room', { state: { roomName } });
    } catch (error) {
      console.error(error);
    }
  };
  

  return (
    <Routes>
      <Route path='/' element={
        <div>
          <h1>WebSocket Chat</h1>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button onClick={handleButtonClick}>Send</button>
        </div>
      }/>
      <Route path='/room' element={<Room/>}/>
    </Routes>
  );
};

export default App;