import React from 'react';
import Modal from 'react-modal';

export const PasswordModal = ({ modalIsOpen, closeButton, roomPassword, setRoomPassword, joinButton }) => {
    return (
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeButton}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="비밀번호 입력"
        ariaHideApp={false}
      >
        <h2 style={{ display: 'flex', justifyContent: 'center' }}>PASSWORD</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <input
            style={{ outline: 'none' }}
            type="password"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
          />
          <button className='modal-button-submit modal-button' onClick={joinButton}>Join</button>
          <button className='modal-button-cancel modal-button' onClick={closeButton}>Cancel</button>
        </div>
      </Modal>
    );
};