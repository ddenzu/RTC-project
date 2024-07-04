import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { useLocation } from 'react-router-dom';
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useWebSocket } from './utils/websocket';
import { drawPath, undoLastPath } from './utils/canvas';

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
  const { newSocket, sendDataToWebSocket } = useWebSocket(state.roomName, state.roomPassword);

  useEffect(() => {
    if (!newSocket) return;
  
    const handleWebSocketMessage = (data) => {
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
  
    newSocket.on('message', handleWebSocketMessage);
  
    const handleResizeEnd = debounce(() => { // 윈도우 크기 조절 시 캔버스 조절하는 함수
      redrawCanvas();
      setTimeout(() => {
        setImagePosition((prevPosition) => ({
          x: prevPosition.x + 1,
          y: prevPosition.y,
        }));
      }, 100);
    }, 100);
  
    const redrawCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setCanvasDimensions();
  
      if (image) {
        const img = new Image();
        img.onload = () => {
          drawImageOnCanvas(ctx, img);
        };
        img.src = image;
      }
  
      drawingPaths.forEach((path) => {
        drawPath(ctx, path);
      });
      
    };
  
    window.addEventListener('resize', handleResizeEnd); // 윈도우 크기 조정시
  
    return () => {
      newSocket.off('message', handleWebSocketMessage); // 메모리 누수방지, 성능 최적화, 불필요한 업데이트 방지를 위한 핸들러 제거
      window.removeEventListener('resize', handleResizeEnd);
    };
  }, [newSocket, image, drawingPaths, imagePosition]);

  const sendMessageData = () => {
    const data = {
      type: 'chatMessage',
      messages: inputMessage,
    }
    setMessages([...messages, inputMessage]);
    setInputMessage('');
    sendDataToWebSocket(data);
  }

  const sendImageData = () => {
    const data = {
      type: 'image',
      image: image,
    };
    sendDataToWebSocket(data);
  };

  const sendImageMoveData = () => {
    const data = {
      type: 'image_move',
      image: image,
      position: {x:position.x, y:position.y},
    };
    sendDataToWebSocket(data);
  };

  const sendDrawData = () => {
    const data = {
      type: 'draw',
      color: selectedColor,
      width: selectedWidth,
      path: drawingPaths[drawingPaths.length - 1],
    };
    sendDataToWebSocket(data);
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
  };

  const handleWidthClick = (event) => {
    setSelectedWidth(event.target.value);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = event.target.value;
  };

  const compressImage = (dataUrl, callback) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      // 이미지의 원본 크기를 유지
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
  
      // 이미지 품질을 0.7로 설정하여 JPEG 형식으로 압축
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      callback(compressedDataUrl);
    };
    img.src = dataUrl;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        compressImage(reader.result, (compressedDataUrl) => {
          setImage(compressedDataUrl);
        });
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    if (image!==null) {
      sendImageData();
    }
  }, [image])

  const setCanvasDimensions = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    if (image) {
      const img = new Image();
      img.onload = () => {
        drawImageOnCanvas(ctx, img, imagePosition.x, imagePosition.y, img.width / 3, img.height / 3);
      };
      img.src = image;
    } else {
      ctx.lineCap = 'round';
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = selectedWidth;
    }
  };

  useEffect(() => {
    setCanvasDimensions();
  }, [image]);

  const drawImageOnCanvas = (ctx, img) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.drawImage(img, position.x, position.y, img.width / 3, img.height / 3);
    drawingPaths.forEach((path) => {
      drawPath(ctx, path);
    });
  };

  const handleMouseDown = (e) => {
    if (!isToggleActive) return;
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseDown2 = (e) => {
    handleColorClick(selectedColor) // 색상선택오류 조치
    const ctx = canvasRef.current.getContext('2d');
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setDrawingPaths([...drawingPaths, { path: [], color: ctx.strokeStyle, width: ctx.lineWidth }]);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      undoLastPath(canvasRef, drawingPaths, setDrawingPaths, setSelectedColor, setCanvasDimensions);
      if (newSocket) {
        newSocket.emit('message', { type: 'erase' })
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isToggleActive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - mousePosition.x;
    const y = e.clientY - rect.top - mousePosition.y;

    setPosition({
      x: position.x + x,
      y: position.y + y,
    });

    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    const ctx = canvasRef.current.getContext('2d');
    const img = new Image();
    img.onload = () => {
      drawImageOnCanvas(ctx, img);
    };
    img.src = image;
  };

  const handleMouseUp = () => {
    sendImageMoveData()
    setIsDragging(false);
  };

  const handleMouseMove2 = (e) => {
    if (!isDrawing) return;
    console.log(selectedColor)
    const ctx = canvasRef.current.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    const updatedPaths = [...drawingPaths];
    updatedPaths[updatedPaths.length - 1].path.push({ x: offsetX, y: offsetY });
    setDrawingPaths(updatedPaths);
  };

  const handleMouseUp2 = () => {
    setIsDrawing(false);
    sendDrawData();
  };
  const handleToggleChange = () => {
    setIsToggleActive(!isToggleActive);
    if (!isToggleActive) {
      setIsDragging(false);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawingPaths]);

  const handleKeyPress = (e) => {
    if (e.key == 'Enter'){
      sendMessageData();
    }
  }
  
  
  const colors = [
    { name: 'red', value: 'red' },
    { name: 'yellow', value: 'yellow' },
    { name: 'green', value: 'rgb(54, 197, 41)' },
    { name: 'blue', value: 'blue' },
    { name: 'black', value: 'black' },
    { name: 'white', value: 'white' },
  ];
  
  const renderColorOptions = () =>
    colors.map(({ name, value }) => (
      <div
        key={name}
        className={`color-option ${name} ${selectedColor === value ? 'color-underline' : ''}`}
        onClick={() => handleColorClick(value)}
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
        <button onClick={sendMessageData}>Send</button>
      </div>
      <ToastContainer 
        toastStyle={{
          backgroundColor: 'rgba(51, 51, 51, 0.7)',
          color: '#fff',
        }} />
      <div className='control-bar'>
        <input type="file" className='file-select' onChange={handleImageChange} />
        <input
          type="range"
          className='range-select'
          min="1"
          max="10"
          step="1"
          value={selectedWidth}
          onChange={handleWidthClick}
        />
        <div className="color-selector">{renderColorOptions()}</div>
        <label className="toggle">
          <input type="checkbox" onChange={handleToggleChange} checked={isToggleActive} />
          <span className="slider"></span>
        </label>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={isToggleActive ? handleMouseDown : handleMouseDown2}
        onMouseUp={isToggleActive ? handleMouseUp : handleMouseUp2}
        onMouseMove={isToggleActive ? handleMouseMove : handleMouseMove2}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default Room;
