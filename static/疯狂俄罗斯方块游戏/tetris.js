
/* 动态计算，生成<canvas.../>组件 */
var createCanvas = function(rows, cols, cellWidth, cellHeight){
  var tetris_canvas = document.createElement("canvas");
  tetris_canvas.width = cols*cellWidth;
  tetris_canvas.height = rows*cellHeight;
  tetris_canvas.style.border="1px solid black";

  var tetris_ctx = tetris_canvas.getContext("2d");
  tetris_ctx.beginPath();
  for(var i=1; i<
}
