import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
// 웹소켓 관련 기능 모음
export const useWebSocket = (roomName, roomPassword, ) => {
  const [newSocket, setNewSocket] = useState(null);

  useEffect(() => {
    const socket = io(`http://192.168.219.107:8080/room`, {
      query: {
        room: roomName,
        password: roomPassword
      }
    });

    socket.on('connect', () => {
      console.log('웹 소켓 연결이 열렸습니다.');
    });

    socket.on('clientJoined', () => {
      toast.info(`새로운 참가자가 입장했습니다`);
    });

    socket.on('leaveRoom', () => {
      toast.info(`참가자가 퇴장했습니다`);
    });

    socket.on('disconnect', () => {
      console.log('웹 소켓 연결이 닫혔습니다.');
    });

    // 소켓 상태를 업데이트
    setNewSocket(socket);
    
    return () => {
      console.log('컴포넌트 언마운트: 소켓 연결 종료');
      socket.disconnect();
    };
  }, [roomName, roomPassword]);

  const sendDataToWebSocket = (data) => {
    if (newSocket) {
      newSocket.emit('message', data)
    } else {
      console.log('WebSocket 연결이 아직 완료되지 않았습니다.');
    }
  };

  const eraseLine = () => {
    if (newSocket) {
      newSocket.emit('message', { type: 'erase' })
    }
  }

  return {
    newSocket,
    sendDataToWebSocket,
    eraseLine
  };
};
