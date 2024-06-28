export const sendDrawData = (selectedColor, selectedWidth, drawingPaths, sendDataToWebSocket) => {
    const data = {
      type: 'draw',
      color: selectedColor,
      width: selectedWidth,
      path: drawingPaths[drawingPaths.length - 1],
    };
    sendDataToWebSocket(data);
  };