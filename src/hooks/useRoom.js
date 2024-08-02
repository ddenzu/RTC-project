import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import { undoLastPath, drawCanvas, handleImageClick, 
    handleImageDrag, handlePenClick, handlePenDrag,
    handleReceivedData, handleResizeCanvas } from '../utils/canvas.js';
import { sendMessageData, sendImageData, sendImageMoveData, sendDrawData } from '../services/api.js';

const useRoom = () => {
    const location = useLocation();
    const { state } = location;
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isToggleActive, setIsToggleActive] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingPaths, setDrawingPaths] = useState([]);
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [selectedColor, setSelectedColor] = useState('white');
    const [selectedWidth, setSelectedWidth] = useState(2);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { newSocket, sendDataToWebSocket, eraseLine } = useWebSocket(state.roomName, state.roomPassword);
  
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
    };
  
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
    };
  
    const imageDrop = (e) => {
      sendImageMoveData(
        image, 
        position, 
        sendDataToWebSocket
      );
      setIsDragging(false);
    };
  
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
    };
  
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
      if (e.key === 'Enter') {
        sendMessageData(
          inputMessage, 
          setMessages, 
          setInputMessage, 
          sendDataToWebSocket
        );
      }
    };
  
    const erase = () => {
      undoLastPath(
        canvasRef, 
        drawingPaths, 
        setDrawingPaths, 
        setSelectedColor, 
        setCanvasDimensions
      );
      eraseLine();
    };
  
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
  
    useEffect(() => {
      if (image !== null) {
        sendImageData(image, sendDataToWebSocket);
      }
      setCanvasDimensions();
    }, [image]);
  
    useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [drawingPaths]);
  
    const setCanvasDimensions = () => {
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
  
    return {
      canvasRef,
      image,
      setImage,
      isDragging,
      setIsDragging,
      position,
      setPosition,
      mousePosition,
      setMousePosition,
      isToggleActive,
      setIsToggleActive,
      isDrawing,
      setIsDrawing,
      drawingPaths,
      setDrawingPaths,
      imagePosition,
      setImagePosition,
      selectedColor,
      setSelectedColor,
      selectedWidth,
      setSelectedWidth,
      messages,
      setMessages,
      inputMessage,
      setInputMessage,
      isModalOpen,
      setIsModalOpen,
      receivedData,
      imageClick,
      imageDrag,
      imageDrop,
      penClick,
      penDrag,
      penDrop,
      toggleChange,
      handleKeyPress,
      erase,
      handleKeyDown,
      openModal,
      closeModal,
      setCanvasDimensions,
      sendDataToWebSocket
    };
};
  
export {useRoom};