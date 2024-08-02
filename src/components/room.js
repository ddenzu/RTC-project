import React from 'react';
import '../App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ManualModal } from './modals/manualModal.js';
import { updateWidth,uploadImage,renderColor  } from '../utils/canvas.js';
import { sendMessageData } from '../services/api.js';
import {useRoom} from '../hooks/useRoom'; 
const Room = () => {
    const {
      canvasRef,
      setImage,
      isToggleActive,
      selectedColor,
      setSelectedColor,
      selectedWidth,
      setSelectedWidth,
      messages,
      setMessages,
      inputMessage,
      setInputMessage,
      isModalOpen,
      imageClick,
      imageDrag,
      imageDrop,
      penClick,
      penDrag,
      penDrop,
      toggleChange,
      handleKeyPress,
      erase,
      openModal,
      closeModal,
      sendDataToWebSocket
    } = useRoom();

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
