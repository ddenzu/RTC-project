import React, { useRef, useEffect, useState } from 'react';
import './App.css';

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
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
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

  const drawImageOnCanvas = (ctx, img) => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); 
    ctx.drawImage(img, position.x, position.y, img.width/3, img.height/3); 


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


  const handleMouseUp = () => {
    setIsDragging(false); 
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

  return (
    <div className="App" style={{ position: 'relative' }}>
      <div className='control-bar'>
        <input type="file" onChange={handleImageChange} />
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
