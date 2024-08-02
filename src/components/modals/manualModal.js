import React from 'react';

export const ManualModal = ({ isModalOpen, closeModal }) => (
  <>
    {isModalOpen && (
      <div className='modal-overlay' onClick={closeModal}>
        <div className='modal-content' onClick={(e) => e.stopPropagation()}>
          <h2>사용 방법</h2>
          <p>1. 드래그로 펜을 사용할 수 있습니다.</p>
          <p>2. Range 로 선의 굵기를 조절할 수 있습니다.</p>
          <p>3. 파일 첨부로 이미지 파일을 업로드 할 수 있습니다.</p>
          <p>4. 토글을 작동시키고 드래그하면 이미지 파일의 위치를 옮길 수 있습니다.</p>
          <p>5. ↩ 버튼을 클릭하거나 Ctrl + Z 키를 눌러 선을 삭제 할 수 있습니다.</p>
          <p className='warn'>F12 (개발자도구)를 사용하면 성능이 저하됩니다.</p>
          <button className='close-button' onClick={closeModal}>
            확인
          </button>
        </div>
      </div>
    )}
  </>
);