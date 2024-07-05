// canvas 관련 기능 모음
import { debounce } from 'lodash';

export const drawPath = (ctx, path) => {  // 파라미터로 들어오는 path 는 drawingPaths 배열의 값
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

export const undoLastPath = (canvasRef, drawingPaths, setDrawingPaths, setSelectedColor, setCanvasDimensions ) => {
  const canvas = canvasRef.current; // drawingPaths 배열의 마지막 line 을 지우고 이미지와 라인 그리는 함수
  const ctx = canvas.getContext('2d');
  const lastPath = drawingPaths.pop();
  const copyPaths = [...drawingPaths];
  setDrawingPaths([...drawingPaths]);
  if (lastPath) {
    const deletedPathColor = lastPath.color;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasDimensions();// 이 함수에서 업데이트된 drawingPaths 와 position 기반으로 캔버스 다시 그려줌
    document.querySelectorAll('.color-option').forEach((option) => {
      option.classList.remove('color-underline');
    });
    // 저장된 색상으로 이전에 그려진 선들을 다시 그림
    copyPaths.forEach((path) => { // setCanvasDimensions 함수에서도 라인이 그려지기 때문에 코드개선 필요
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.beginPath();
      path.path.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });
    // 삭제된 선의 색상을 다시 설정
    setSelectedColor(deletedPathColor)
    ctx.strokeStyle = deletedPathColor;
  }
};

export const drawCanvas = (ctx, img, position, drawingPaths) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(img, position.x, position.y, img.width / 3, img.height / 3);
  drawingPaths.forEach((path) => {
    drawPath(ctx, path);
  });
};

export const updateColor = (canvasRef, color, setSelectedColor) => {
  setSelectedColor(color);
  const ctx = canvasRef.current.getContext('2d');
  ctx.strokeStyle = color;
};

export const updateWidth = (canvasRef, width, setSelectedWidth) => {
  setSelectedWidth(width);
  const ctx = canvasRef.current.getContext('2d');
  ctx.lineWidth = width;
};

export const handleImageClick = (canvasRef, isToggleActive, setIsDragging, setMousePosition, e) => {
  if (!isToggleActive) return;
  setIsDragging(true);
  const rect = canvasRef.current.getBoundingClientRect();
  setMousePosition({
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  });
};

export const handleImageDrag = (canvasRef,position,isDragging, isToggleActive,drawingPaths,e,image,setPosition,
  setMousePosition,mousePosition ) => {
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
    drawCanvas(ctx, img, position, drawingPaths);
  };
  img.src = image;
};

export const handlePenClick = (e, canvasRef, selectedColor, setSelectedColor, selectedWidth, setSelectedWidth, setIsDrawing, drawingPaths, setDrawingPaths) => {
  updateColor(canvasRef, selectedColor, setSelectedColor);
  updateWidth(canvasRef, selectedWidth, setSelectedWidth);
  
  const ctx = canvasRef.current.getContext('2d');
  setIsDrawing(true);
  
  const { offsetX, offsetY } = e.nativeEvent;
  ctx.beginPath();
  ctx.moveTo(offsetX, offsetY);
  
  setDrawingPaths([...drawingPaths, { path: [], color: ctx.strokeStyle, width: ctx.lineWidth }]);
};

export const handlePenDrag = (e, canvasRef, isDrawing, drawingPaths, setDrawingPaths) => {
  if (!isDrawing) return;
  
  const ctx = canvasRef.current.getContext('2d');
  const { offsetX, offsetY } = e.nativeEvent;
  
  ctx.lineTo(offsetX, offsetY);
  ctx.stroke();
  
  const updatedPaths = [...drawingPaths];
  updatedPaths[updatedPaths.length - 1].path.push({ x: offsetX, y: offsetY });
  setDrawingPaths(updatedPaths);
};

export const compressImage = (dataUrl, callback) => {
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

export const handleResizeCanvas = (canvasRef, image, position, drawingPaths, setImagePosition) => {
  return debounce(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { innerWidth, innerHeight } = window;
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      const img = new Image();
      img.onload = () => {
        drawCanvas(ctx, img, position, drawingPaths);
      };
      img.src = image;
    } else {
      drawingPaths.forEach((path) => {
        drawPath(ctx, path);
      });
    }

    setTimeout(() => {
      setImagePosition((prevPosition) => ({
        x: prevPosition.x + 1,
        y: prevPosition.y,
      }));
    }, 100);
  }, 100);
};

export const handleWebSocketData = (canvasRef, setImage, setSelectedColor, setSelectedWidth, 
  setDrawingPaths, setPosition, drawingPaths, setMessages, setCanvasDimensions) => (data) => {
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
    console.log('s')
    undoLastPath(canvasRef, drawingPaths, setDrawingPaths, setSelectedColor, setCanvasDimensions);
  } else if (data.type === 'image_move') {
    const imageUrl = data.image;
    const img = new Image();
    img.onload = () => {
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

export const colors = [
  { name: 'red', value: 'red' },
  { name: 'yellow', value: 'yellow' },
  { name: 'green', value: 'rgb(54, 197, 41)' },
  { name: 'blue', value: 'blue' },
  { name: 'black', value: 'black' },
  { name: 'white', value: 'white' },
];