// 데이터를 웹소켓으로 전송하는 기능 모음
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