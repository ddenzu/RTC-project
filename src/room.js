import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWebSocket } from './utils/websocket';
import { drawPath, undoLastPath, drawCanvas, updateColor, updateWidth,
  handleImageClick, handleImageDrag, handlePenClick, handlePenDrag, compressImage,
  handleWebSocketData, handleResizeCanvas, colors  } from './utils/canvas';
import { sendMessageData, sendImageData, sendImageMoveData, sendDrawData } from './utils/dataHandler';

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
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedWidth, setSelectedWidth] = useState(2);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const { newSocket, sendDataToWebSocket, eraseLine } = useWebSocket(state.roomName, state.roomPassword);

  const webSocketData = (data) => {
    const ctx = canvasRef.current.getContext('2d');

    if (data.type === 'image') {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, img.width / 3, img.height / 3);
        setImage(data.image);
      };
      img.src = data.image;
    } else if (data.type === 'draw') {
      setSelectedColor(data.color);
      setSelectedWidth(data.width);
      setDrawingPaths((prevPaths) => [...prevPaths, data.path]);

      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.width;
      ctx.beginPath();
      data.path.path.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      });
    } else if (data.type === 'chatMessage') {
      setMessages((messages) => [...messages, data.messages]);
    } else if (data.type === 'erase') {
      undoLastPath(canvasRef, drawingPaths, setDrawingPaths, setSelectedColor, setCanvasDimensions);
    } else if (data.type === 'image_move') {
      const imageUrl = data.image;
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, data.position.x, data.position.y, img.width / 3, img.height / 3);
        setPosition({ x: data.position.x, y: data.position.y });
        drawingPaths.forEach((path) => {
          drawPath(ctx, path);
        });
      };
      img.src = imageUrl;
    }
  };

  useEffect(() => {
    if (!newSocket) return;
    console.log('aaa')
    newSocket.on('message', webSocketData);

    const resizeCanvas = handleResizeCanvas(canvasRef, image, position, drawingPaths, setImagePosition);
    window.addEventListener('resize', resizeCanvas);
  
    return () => {
      newSocket.off('message', webSocketData);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [newSocket, image, drawingPaths, imagePosition]);

//-------------------------------------------------------------------
  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        compressImage(reader.result, (compressedDataUrl) => { // 이미지 최적화
          setImage(compressedDataUrl);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const imageClick = (e) => {
    handleImageClick(canvasRef, isToggleActive, setIsDragging, setMousePosition, e);
  }

  const imageDrag = (e) => {
    handleImageDrag(canvasRef,position,isDragging, isToggleActive,drawingPaths,e,image,setPosition,
    setMousePosition,mousePosition)
  }

  const imageDrop = (e) => {
    sendImageMoveData(image, position, sendDataToWebSocket);
    setIsDragging(false);
  }

  const penClick = (e) => {
    handlePenClick(e, canvasRef, selectedColor, setSelectedColor, selectedWidth, setSelectedWidth, setIsDrawing, drawingPaths, setDrawingPaths);
  }

  const penDrag = (e) => {
    handlePenDrag(e, canvasRef, isDrawing, drawingPaths, setDrawingPaths);
  };


  const penDrop = () => {
    sendDrawData(drawingPaths, selectedColor, selectedWidth, sendDataToWebSocket);
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
      sendMessageData(inputMessage, setMessages, setInputMessage, sendDataToWebSocket);
    }
  }

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      undoLastPath(canvasRef, drawingPaths, setDrawingPaths, setSelectedColor, setCanvasDimensions);
      eraseLine();
    }
  };

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
  
  const renderColor = () =>
    colors.map(({ name, value }) => (
      <div
        key={name}
        className={`color-option ${name} ${selectedColor === value ? 'color-underline' : ''}`}
        onClick={() => updateColor(canvasRef,value,setSelectedColor)}
      ></div>
    )
  );

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
        <input type="file" className='file-select' onChange={uploadImage} />
        <input
          type="range"
          className='range-select'
          min="1"
          max="10"
          step="1"
          value={selectedWidth}
          onChange={(event) => updateWidth(canvasRef, event.target.value, setSelectedWidth)}
        />
        <div className="color-selector">{renderColor()}</div>
        <label className="toggle">
          <input type="checkbox" onChange={toggleChange} checked={isToggleActive} />
          <span className="slider"></span>
        </label>
      </div>
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
