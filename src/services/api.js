// 데이터를 서버로 전송하는 기능 모음
export const sendMessageData = (inputMessage, setMessages, setInputMessage, sendDataToWebSocket) => {
    const data = {
      type: 'chatMessage',
      messages: inputMessage,
    }
    setMessages(prevMessages => [...prevMessages, inputMessage]);
    setInputMessage('');
    sendDataToWebSocket(data);
}
  
export const sendImageData = (image, sendDataToWebSocket) => {
    const data = {
      type: 'image',
      image: image,
    };
    sendDataToWebSocket(data);
};
  
export const sendImageMoveData = (image, position, sendDataToWebSocket) => {
    const data = {
      type: 'image_move',
      image: image,
      position: { x: position.x, y: position.y },
    };
    sendDataToWebSocket(data);
};
  
export const sendDrawData = (drawingPaths, selectedColor, selectedWidth, sendDataToWebSocket) => {
    const data = {
      type: 'draw',
      color: selectedColor,
      width: selectedWidth,
      path: drawingPaths[drawingPaths.length - 1],
    };
    sendDataToWebSocket(data);
};

export const fetchRoomList = async () => {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('방목록 가져오기 실패');
    }
    return response.json();
};
  
export const checkRoomPassword = async (roomName, roomPassword) => {
    const response = await fetch('/api/checkPassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, roomPassword }),
    });
  
    const data = await response.json();
    return data.success;
};