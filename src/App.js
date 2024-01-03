import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import { debounce } from 'lodash'; 

const App = () => {
  const canvasRef = useRef(null); 
  const [image, setImage] = useState(null); 
  const [isDragging, setIsDragging] = useState(false); 
  const [position, setPosition] = useState({ x: 0, y: 0 }); 
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); 
  const [isToggleActive, setIsToggleActive] = useState(false); 
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPaths, setDrawingPaths] = useState([]);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedWidth, setSelectedWidth] = useState(2);
  const [isWebSocketOpen, setIsWebSocketOpen] = useState(false);
  const [drawingData, setdrawingData] = useState({});

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');
    ws.onopen = () => {
      console.log('웹 소켓 연결이 열렸습니다.');
      setIsWebSocketOpen(true);
    };
    console.log(drawingPaths)
    ws.onmessage = (event) => {

      const receivedData = JSON.parse(event.data);

      if (receivedData.type === 'image_move') {
        const imageUrl = receivedData.image;
        const img = new Image();
        img.onload = () => {
          const ctx = canvasRef.current.getContext('2d');
          ctx.drawImage(img, 0, 0, img.width / 3, img.height / 3);
          setImage(imageUrl)
        };
        img.src = imageUrl;
        return;
      }
      if (receivedData.type === 'draw') {
        setSelectedColor(receivedData.color);
        setSelectedWidth(receivedData.width);
        setdrawingData(receivedData.path);
    
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = receivedData.color;
        ctx.lineWidth = receivedData.width;
        ctx.beginPath();
        receivedData.path.path.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          }
        });
        setDrawingPaths(prevPaths => [...prevPaths, receivedData.path]);
      }
    };
  }, []);

  const sendDataToWebSocket = (data) => {
    const ws = new WebSocket('ws://localhost:8000');
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      console.log('WebSocket 연결이 아직 완료되지 않았습니다.');
      // 연결이 완료되면 데이터를 보내도록 대기
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify(data));
      });
    }
  };
  const sendImageMoveData = () => {
    if (isWebSocketOpen) {
      const data = {
        type: 'image_move',
        image: image,
      };
      sendDataToWebSocket(data);
    } else {
      console.log('WebSocket 연결이 완료되지 않았습니다.');
    }
  };
  
  const sendDrawData = () => {
    if (isWebSocketOpen) {
      const data = {
        type: 'draw',
        color: selectedColor,
        width: selectedWidth,
        path: drawingPaths[drawingPaths.length - 1],
      };
      sendDataToWebSocket(data);
    } else {
      console.log('WebSocket 연결이 완료되지 않았습니다.');
    }
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;
  };

  const handleWidthClick = (event) => {
    setSelectedWidth(event.target.value);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = event.target.value;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    if (image !== null) {
      sendImageMoveData();
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

  useEffect(() => {
    window.addEventListener('resize', setCanvasDimensions);

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, []);

  const drawPath = (ctx, path) => {
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.beginPath();
    path.path.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    });
  };

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
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  
  const handleMouseDown2 = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setIsDrawing(true); 

    const { offsetX, offsetY } = e.nativeEvent; 
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);

    setDrawingPaths([...drawingPaths, { path: [], color: ctx.strokeStyle, width: ctx.lineWidth }]);
  };


  const handleMouseMove = (e) => {
    if (!isDragging || !isToggleActive) return; 
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
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

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      drawImageOnCanvas(ctx, img); 
    };
    img.src = image;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove2 = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { offsetX, offsetY } = e.nativeEvent;

    drawingPaths[drawingPaths.length - 1].path.push({ x: offsetX, y: offsetY });

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      undoLastPath(); 
    }
  };

  const undoLastPath = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const lastPath = drawingPaths.pop();
    setDrawingPaths([...drawingPaths]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasDimensions();
    drawingPaths.forEach((path) => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.beginPath();
      path.path.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      });
    });
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

  useEffect(() => {
    const handleResizeEnd = debounce(() => {
      redrawCanvas();
      setTimeout(() => {
        setImagePosition(prevPosition => ({
          x: prevPosition.x + 1,
          y: prevPosition.y
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
  
    window.addEventListener('resize', handleResizeEnd);
    return () => {
      window.removeEventListener('resize', handleResizeEnd);
    };
  }, [image, drawingPaths, imagePosition]);

  return (
    <div className="App" style={{ position: 'relative' }}>
      <div className='control-bar'>
        <input type="file" className='file-select' onChange={handleImageChange} />
        <input type="range" className='range-select' min="1" max="10" step="1" value={selectedWidth}
        onChange={handleWidthClick}/>
        <div className="color-selector">
        <div
          className={`color-option red ${selectedColor === 'red' ? 'color-underline' : ''}`}
          onClick={() => handleColorClick('red')}
        ></div>
        <div
          className={`color-option yellow ${selectedColor === 'yellow' ? 'color-underline' : ''}`}
          onClick={() => handleColorClick('yellow')}
        ></div>
        <div
          className={`color-option blue ${selectedColor === 'blue' ? 'color-underline' : ''}`}
          onClick={() => handleColorClick('blue')}
        ></div>
        <div
          className={`color-option black ${selectedColor === 'black' ? 'color-underline' : ''}`}
          onClick={() => handleColorClick('black')}
        ></div>
        <div
          className={`color-option white ${selectedColor === 'white' ? 'color-underline' : ''}`}
          onClick={() => handleColorClick('white')}
        ></div>
      </div>
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

export default App;
