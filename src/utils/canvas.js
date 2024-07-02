import { useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';

// drawPath 함수
export const drawPath = (ctx, path) => {
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
};

// drawAllPaths 함수
// export const drawAllPaths = (ctx, paths) => {
//   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 필요시 캔버스 초기화
//   ctx.save(); // 캔버스 상태 저장

//   for (const path of paths) {
//     drawPath(ctx, path);
//   }

//   ctx.restore(); // 캔버스 상태 복원
// };

// // optimizedDrawAllPaths 함수
// export const optimizedDrawAllPaths = (ctx, paths) => {
//   requestAnimationFrame(() => drawAllPaths(ctx, paths));
// };

// // useCanvasEffect 커스텀 훅
// export const useCanvasEffect = (canvasRef, drawingPaths) => {
//   useEffect(() => {
//     const offscreenCanvas = document.createElement('canvas');
//     offscreenCanvas.width = canvasRef.current.width;
//     offscreenCanvas.height = canvasRef.current.height;
//     const offscreenCtx = offscreenCanvas.getContext('2d');
//     console.log('aaa')
//     const drawPathsWithDebounce = debounce(() => {
//       optimizedDrawAllPaths(offscreenCtx, drawingPaths);
//       const mainCtx = canvasRef.current.getContext('2d');
//       mainCtx.drawImage(offscreenCanvas, 0, 0);
//     }, 10); // 필요시 debounce 시간을 조정

//     drawPathsWithDebounce();

//     return () => {
//       drawPathsWithDebounce.cancel();
//     };
//   }, [drawingPaths]);
// };

export const undoLastPath = (canvasRef, drawingPaths, setDrawingPaths, setSelectedColor, setCanvasDimensions ) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const lastPath = drawingPaths.pop();
    setDrawingPaths([...drawingPaths]);
    if (lastPath) {
      const deletedPathColor = lastPath.color;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setCanvasDimensions();
      document.querySelectorAll('.color-option').forEach((option) => {
        option.classList.remove('color-underline');
      });
      // 저장된 색상으로 이전에 그려진 선들을 다시 그림
      drawingPaths.forEach((path) => {
        console.log('aaa')
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
  
      // 삭제된 선의 색상을 다시 설정
      setSelectedColor(deletedPathColor);
      ctx.strokeStyle = deletedPathColor;
    }
  };