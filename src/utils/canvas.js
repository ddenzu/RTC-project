import { useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
// canvas 관련 기능 모음
// drawPath 함수
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