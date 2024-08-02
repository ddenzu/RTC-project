import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { fetchRoomList, checkRoomPassword } from '../services/api.js';

const useEntrance = () => {
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

  return {
    roomName,
    setRoomName,
    roomPassword,
    setRoomPassword,
    modalIsOpen,
    setModalIsOpen,
    tempRoomName,
    setTempRoomName,
    navigate,
    roomList,
    isLoading,
    makeNewRoom,
    chooseRoom,
    handleRoomJoin,
    closeButton
  };
};

export {useEntrance};