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
  const [roomList, setRoomList] = useState();

  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, 1000); // 0.1초를 밀리초로 변환하여 전달
  }, []);

  useEffect(()=>{
    console.log(roomList)
  }, [roomList])

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8080/data');
      if (!response.ok) {
        throw new Error('Failed to fetch roomList');
      }
      const roomListData = await response.json();
      setRoomList(roomListData);
    } catch (error) {
      console.error('Error fetching roomList:', error);
    }
  };
  const handleButtonClick = async () => {
    try {
      if (!roomName) {
        alert('방 제목을 지정해 주세요.');
        return;
      }
      return navigate('/room', { state: { roomName } });
    } catch (error) {
      console.error(error);
    }
  };
  const handleJoinRoom = (roomName) => {
    setRoomName(roomName);
    navigate('/room', { state: { roomName } });
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
          <h2>Room List:</h2>
          {roomList && Object.keys(roomList).map((key, index) => (
            <div key={index}>
              방제: {key}, 참가자: {roomList[key]}
              <button onClick={() => handleJoinRoom(key)}>참가</button>
            </div>
          ))}
        </div>
      }/>
      <Route path='/room' element={<Room/>}/>
    </Routes>
  );
};

export default App;