import React, { useRef, useEffect, useState } from 'react';
import '../App.css';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ManualModal } from './modal.js';
import { useWebSocket } from '../utils/websocket.js';
import { undoLastPath, drawCanvas, updateWidth,
  handleImageClick, handleImageDrag, handlePenClick, handlePenDrag, uploadImage,
  handleReceivedData, handleResizeCanvas, renderColor  } from '../utils/canvas.js';
import { sendMessageData, sendImageData, sendImageMoveData, sendDrawData } from '../utils/dataHandler.js';

const Room = () => {
  const location = useLocation();
  const { state } = location;
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // 이미지 파일의 좌표
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isToggleActive, setIsToggleActive] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState([]);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedWidth, setSelectedWidth] = useState(2);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const { newSocket, sendDataToWebSocket, eraseLine } = useWebSocket(state.roomName, state.roomPassword);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const receivedData = (data) => {
    handleReceivedData(
      canvasRef,
      data,
      setImage,
      setMessages,
      setSelectedColor,
      setSelectedWidth,
      setDrawingPaths,
      undoLastPath,
      setCanvasDimensions,
      setPosition,
      drawingPaths
    );
  };

  const imageClick = (e) => {
    handleImageClick(
      canvasRef, 
      isToggleActive, 
      setIsDragging, 
      setMousePosition, 
      e
    );
  }

  const imageDrag = (e) => {
    handleImageDrag(
      canvasRef,
      position,
      isDragging, 
      isToggleActive,
      drawingPaths,
      image,
      setPosition,
      setMousePosition,
      mousePosition,
      e
    );
  }

  const imageDrop = (e) => {
    sendImageMoveData(
      image, 
      position, 
      sendDataToWebSocket
    );
    setIsDragging(false);
  }

  const penClick = (e) => {
    handlePenClick(
      canvasRef, 
      selectedColor, 
      setSelectedColor, 
      selectedWidth, 
      setSelectedWidth, 
      setIsDrawing, 
      drawingPaths, 
      setDrawingPaths,
      e
    );
  }

  const penDrag = (e) => {
    handlePenDrag(
      canvasRef, 
      isDrawing, 
      drawingPaths, 
      setDrawingPaths,
      e
    );
  };

  const penDrop = () => {
    sendDrawData(
      drawingPaths, 
      selectedColor, 
      selectedWidth, 
      sendDataToWebSocket
    );
    setIsDrawing(false);
  };

  const toggleChange = () => {
    setIsToggleActive(!isToggleActive);
    if (!isToggleActive) {
      setIsDragging(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key == 'Enter'){
      sendMessageData(
        inputMessage, 
        setMessages, 
        setInputMessage, 
        sendDataToWebSocket);
    }
  }

  const erase = () => {
    undoLastPath(
      canvasRef, 
      drawingPaths, 
      setDrawingPaths, 
      setSelectedColor, 
      setCanvasDimensions
    );
    eraseLine();
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      erase();
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!newSocket) return;
    newSocket.on('message', receivedData);

    return () => {
      newSocket.off('message', receivedData);
    };
  }, [newSocket, receivedData]);

  useEffect(() => {
    const resizeCanvas = handleResizeCanvas(canvasRef, image, position, drawingPaths, setImagePosition);
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [image, drawingPaths, imagePosition]);

  useEffect(() => { // 이미지가 처음 생성됐을 때
    if (image!==null) {
      sendImageData(image, sendDataToWebSocket);
    }
    setCanvasDimensions();
  }, [image])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawingPaths]);

  const setCanvasDimensions = () => { // 함수 종속 때문에 일단 메인컴포넌트에 유지
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    if (image) {
      const img = new Image();
      img.onload = () => {
        drawCanvas(ctx, img, position, drawingPaths);
      };
      img.src = image;
    } else {
      ctx.lineCap = 'round';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = selectedWidth;
    }
  };

  return (
    <div className="App" style={{ position: 'relative' }}>
      <div className='chat-box'>
        <div className='messages-area'>
          <div className='chat-messages'>
            {messages.map((message, index) => (
              <div style={{margin: '2px 2px 2xp 5px'}} key={index}>{message}</div>
            ))}
          </div>
        </div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={() => sendMessageData(inputMessage, setMessages, setInputMessage, sendDataToWebSocket)}>Send</button> 
      </div>
      <ToastContainer 
        toastStyle={{
          backgroundColor: 'rgba(51, 51, 51, 0.7)',
          color: '#fff',
        }} />
      <div className='control-bar'>
        <input type="file" className='file-select' onChange={(e) => uploadImage(e, setImage)} />
        <input
          type="range"
          className='range-select'
          min="1"
          max="10"
          step="1"
          value={selectedWidth}
          onChange={(event) => updateWidth(canvasRef, event.target.value, setSelectedWidth)}
        />
        <div className="color-selector">{renderColor(selectedColor, canvasRef, setSelectedColor)}</div>
        <label className="toggle">
          <input type="checkbox" onChange={toggleChange} checked={isToggleActive} />
          <span className="slider"></span>
        </label>
      </div>
      <button className="fixed-button" onClick={erase}>↩</button>
      <button className="manual-button" onClick={openModal}>manual</button>
      <ManualModal isModalOpen={isModalOpen} closeModal={closeModal} />
      <canvas
        ref={canvasRef}
        onMouseDown={isToggleActive ? imageClick : penClick}
        onMouseUp={isToggleActive ? imageDrop : penDrop}
        onMouseMove={isToggleActive ? imageDrag : penDrag}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default Room;
