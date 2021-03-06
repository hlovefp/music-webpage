﻿
const NO_BLOCK = 0;
const TETRIS_ROWS = 20;
const TETRIS_COLS = 10;
const CELL_SIZE = 20;
const colors = [ 'black', 'black', 'black', 'black', 'black', 'black', 'black', 'black'];

/* 创建canvas组件 */
var createCanvas = function(rows, cols, cellWidth, cellHeight){
  var tetris_canvas = document.createElement("canvas");
  tetris_canvas.width = cols*cellWidth;
  tetris_canvas.height = rows*cellHeight;
  tetris_canvas.style.border="1px solid black";

  tetris_ctx = tetris_canvas.getContext("2d");
  tetris_ctx.beginPath();
  // 绘制横向网格
  for(var i=1; i<TETRIS_ROWS; i++){
  	tetris_ctx.moveTo(0,i*CELL_SIZE)
  	tetris_ctx.lineTo(TETRIS_COLS*CELL_SIZE,i*CELL_SIZE);
  }
  // 绘制纵向网格
  for(var i=1;i<TETRIS_COLS;i++){
  	tetris_ctx.moveTo(i*CELL_SIZE,0);
  	tetris_ctx.lineTo(i*CELL_SIZE,TETRIS_ROWS*CELL_SIZE);
  }
  tetris_ctx.closePath();
  tetris_ctx.strokeStyle="#aaa";
  tetris_ctx.lineWidth=0.3;
  tetris_ctx.stroke();

  return tetris_canvas
}


/* 下落方块的可能组合 */
var blockArr = [
	// 组合 Z
	[
		{x:TETRIS_COLS/2-1, y:0, color:1},
		{x:TETRIS_COLS/2,   y:0, color:1},
		{x:TETRIS_COLS/2,   y:1, color:1},
		{x:TETRIS_COLS/2+1, y:1, color:1}
	],
	// 组合，反 Z
	[
		{x:TETRIS_COLS/2+1, y:0, color:2},
		{x:TETRIS_COLS/2,   y:0, color:2},
		{x:TETRIS_COLS/2,   y:1, color:2},
		{x:TETRIS_COLS/2-1, y:1, color:2}
	],
	// 组合，田
	[
		{x:TETRIS_COLS/2-1, y:0, color:3},
		{x:TETRIS_COLS/2,   y:0, color:3},
		{x:TETRIS_COLS/2-1, y:1, color:3},
		{x:TETRIS_COLS/2,   y:1, color:3}
	],
	// 组合，L
	[
		{x:TETRIS_COLS/2-1, y:0, color:4},
		{x:TETRIS_COLS/2-1, y:1, color:4},
		{x:TETRIS_COLS/2-1, y:2, color:4},
		{x:TETRIS_COLS/2,   y:2, color:4}
	],
	// 组合，J
	[
		{x:TETRIS_COLS/2,  y:0, color:5},
		{x:TETRIS_COLS/2,  y:1, color:5},
		{x:TETRIS_COLS/2,  y:2, color:5},
		{x:TETRIS_COLS/2-1,y:2, color:5}
	],
	// 组合，条
	[
		{x:TETRIS_COLS/2,  y:0, color:6},
		{x:TETRIS_COLS/2,  y:1, color:6},
		{x:TETRIS_COLS/2,  y:2, color:6},
		{x:TETRIS_COLS/2,  y:3, color:6}
	],
	// 组合，反T
	[
		{x:TETRIS_COLS/2,  y:0, color:7},
		{x:TETRIS_COLS/2-1,y:1, color:7},
		{x:TETRIS_COLS/2,  y:1, color:7},
		{x:TETRIS_COLS/2+1,y:1, color:7}
	]
]

// 绘制游戏界面，不包括下落方块
var drawFrame = function(){
  for(var i=0;i<TETRIS_ROWS;i++){
    for(var j=0;j<TETRIS_COLS;j++){
      // 有方块的地方绘制颜色
      if(tetris_status[i][j] != NO_BLOCK){
        tetris_ctx.fillStyle=colors[tetris_status[i][j]];
      } else {
        tetris_ctx.fillStyle='white';
      }
      tetris_ctx.fillRect(j*CELL_SIZE+1,i*CELL_SIZE+1,CELL_SIZE-2,CELL_SIZE-2);
    }
  }
}

/* 随机生成下落方块 */
var initBlock = function(){
	var rand = Math.floor(Math.random()*blockArr.length);
	currentFall = [
	  { x: blockArr[rand][0].x, y: blockArr[rand][0].y, color: blockArr[rand][0].color },
	  { x: blockArr[rand][1].x, y: blockArr[rand][1].y, color: blockArr[rand][1].color },
	  { x: blockArr[rand][2].x, y: blockArr[rand][2].y, color: blockArr[rand][2].color },
	  { x: blockArr[rand][3].x, y: blockArr[rand][3].y, color: blockArr[rand][3].color }
	]
}

/* 判断一行是否已满 */
var lineFull = function(){
	// 遍历所有行
	for(var i=0; i<TETRIS_ROWS; i++){
		var fullFlag = true;
		// 遍历当前行的每个单元格
		for(var j=0;j<TETRIS_COLS;j++){
			if(tetris_status[i][j]==NO_BLOCK){
				fullFlag=false;
				break;
			}
		}
		// 如果当前行已满
		if(fullFlag){
			// 积分增加100
			curScore += 100;
			curScoreEle.innerHTML = curScore;
			localStorage.setItem("curScore",curScore);
			
			// 当前积分达到升级极限
			if(curScore>=curSpeed*curSpeed*500){
				curSpeed += 1;
				curSpeedEle.innerHTML = curSpeed;
				localStorage.setItem("curSpeed",curSpeed);
				clearInterval(curTimer);
				curTimer = setInterval("moveDown();",500/curSpeed);
			}
			
			// 当前行上面的所有方块下移一行
			for(var k=i; k>0;k--){
				for(var m=0;m<TETRIS_COLS;m++){
					tetris_status[k][m] = tetris_status[k-1][m];
				}
			}
			
            // 消除一行方块后重新绘制游戏界面
            drawFrame();
		}
	}	
}

/* 控制下落方块下移,左移,右移,旋转 */
var controlBlock = function(command){
  //下落前将每个背景涂成白色
  for(var i=0; i<currentFall.length;i++){
	tetris_ctx.fillStyle="white";
    tetris_ctx.fillRect(currentFall[i].x*CELL_SIZE+1,currentFall[i].y*CELL_SIZE+1,CELL_SIZE-2,CELL_SIZE-2);
  }

  // 方块y坐标加1
  for(var i=0;i<currentFall.length;i++){
	switch(command){
	  case "down":
		currentFall[i].y++;
    	break;
	  case "left":
		currentFall[i].x--;
		break;
	  case "right":
		currentFall[i].x++;
		break;
	  case "rotate":
		// 针旋方格,始终以第三个方块作为旋转中心，即i为2的方块
	    for(var i=0;i<currentFall.length;i++){
	      if(i!=2){
	        var afterRotateX = currentFall[2].x-currentFall[2].y+currentFall[i].y;
	        var afterRotateY = currentFall[2].x+currentFall[2].y-currentFall[i].x;
	        currentFall[i].x = afterRotateX;
	        currentFall[i].y = afterRotateY;
	      }
	    }
		break;
	}
  }

  // 方块涂背景色
  for(var i=0; i<currentFall.length;i++){
    tetris_ctx.fillStyle=colors[cur.color];
    tetris_ctx.fillRect(currentFall[i].x*CELL_SIZE+1,currentFall[i].y*CELL_SIZE+1,CELL_SIZE-2,CELL_SIZE-2);
  }
}

/* 控制方块自然向下掉 */
var moveDown = function(){
	var canDown = true;   // 定义能否掉落的旗标

	if(!isPlaying)  return;

	// 遍历每个方块，判断是否能向下掉落
	for(var i=0; i<currentFall.length;i++){
		// 判断是否已经到底，或者下一格是否有方块
		if( currentFall[i].y>=TETRIS_ROWS-1 ||
            tetris_status[currentFall[i].y+1][currentFall[i].x] != NO_BLOCK){
			canDown=false;
			break;
		}
	}

	//能向下掉落
	if(canDown){
		controlBlock("down");
		return;
	}

	// 不能掉落时，下落方块记录到tetris_status数组中
	for(var i=0; i<currentFall.length;i++){
		var cur = currentFall[i];
		// 如果方块已经到最上面，则输了
		if(cur.y<2){
			// 清空Local Storage中的当前积分值、游戏状态、当前速度
			localStorage.removeItem("curScore");
			localStorage.removeItem("tetris_status");
			localStorage.removeItem("curSpeed");
			if(confirm("您已经输了！是否再来一局？")){
				// 读取Local Storage的maxScore记录,记录最高分
				var maxScore = localStorage.getItem("maxScore");
				maxScore = (maxScore==null)?0:maxScore;
				if(curScore>=maxScore){
					localStorage.setItem("maxScore",curScore);
				}
				initBlock();
			}else{
				// 游戏结束
				isPlaying=false;
				// 清除计时器
				clearInterval(curTimer);
			}
			return;
		}
		//保存
		tetris_status[cur.y][cur.x]=cur.color;
	}
	// 判断是否可消除行
	lineFull();
	// 记录游戏状态
	localStorage.setItem("tetris_status",JSON.stringify(tetris_status));
	// 开始一组新的方块
	initBlock();
}

/* 左移方块 */
var moveLeft = function(){
  var canLeft=true;

  if(!isPlaying)  return;
  
  for(var i=0; i<currentFall.length;i++){
    // 判断是否在最左边,或者左边已有方块
    if( currentFall[i].x <= 0 ||
        tetris_status[currentFall[i].y][currentFall[i].x-1] != NO_BLOCK){
      canLeft=false;
      break;
    }
  }
  if(canLeft){
	controlBlock("left");
  }
}

/* 右移方块 */
var moveRight = function(){
  var canRight=true;

  if(!isPlaying)  return;

  for(var i=0; i<currentFall.length;i++){
    // 判断是否在最右边,或者右边已有方块
    if( currentFall[i].x >= TETRIS_COLS-1 ||
        tetris_status[currentFall[i].y][currentFall[i].x+1] != NO_BLOCK){
      canRight=false;
      break;
    }
  }

  if(canRight){
    controlBlock("right");
  }
}

/*
方块逆时针旋转90度
p1(x,y)相对于p0(x0,y0)逆时针旋转90度到P2(x0-y0+y,x0+y0-x)
 */
var rotate=function(){
  var canRotate=true;
  
  if(!isPlaying)  return;
  
  for(var i=0;i<currentFall.length;i++){
    // 始终以第三个方块作为旋转中心，即i为2的方块
    if(i!=2){
      // 计算旋转后的方块坐标
      var afterRotateX = currentFall[2].x-currentFall[2].y+currentFall[i].y;
      var afterRotateY = currentFall[2].x+currentFall[2].y-currentFall[i].x;
      
      // 旋转后所在位置已有方块不能旋转
      if( tetris_status[afterRotateY][afterRotateX+1] != NO_BLOCK ){
    	console.log('rotate false')
        canRotate=false;
        break;
      }

      // 旋转后的坐标超出最左边边界
      if( afterRotateX<0 || tetris_status[afterRotateY-1][afterRotateX] != NO_BLOCK){
    	console.log('move right')
        moveRight();
        break;
      }

      // 旋转后的坐标超出最右边边界
      if( afterRotateX>=TETRIS_COLS-1 || tetris_status[afterRotateY][afterRotateX+1] != NO_BLOCK){
    	  console.log('move left')
        moveLeft();
        break;
      }
    }
  }

  if(canRotate){
	controlBlock("rotate");
  }
}

/* 处理方块移动 */
window.onkeydown=function(evt){
  switch(evt.keyCode){
    case 40:  // 向下箭头
      moveDown();
      break;
    case 37:  // 向左箭头
      moveLeft();
      break;
    case 39: // 向右箭头
      moveRight();
      break;
    case 38: // 向上箭头,旋转方块
      rotate();
      break;
  }
}

window.onload=function(){
  // 创建画布，并绘制网格线
  var tetris_canvas = createCanvas(TETRIS_ROWS,TETRIS_COLS,CELL_SIZE,CELL_SIZE);
  document.getElementById("canvas").appendChild(tetris_canvas);

  /* 初始化游戏界面数据,创建二位数组 */
  for(var i=0; i<TETRIS_ROWS; i++){
  	tetris_status[i] = [];
  	for(var j=0; j<TETRIS_COLS;j++){
  		tetris_status[i][j]=NO_BLOCK;
  	}
  }

  // 优先使用Local Storage的游戏界面数据
  var tmpStatus = localStorage.getItem("tetris_status");
  tetris_status = (tmpStatus == null) ? tetris_status : JSON.parse(tmpStatus);
  
  // 绘制游戏界面，不包括下落方块
  drawFrame();

  curScoreEle = document.getElementById("curScoreEle");
  curSpeedEle = document.getElementById("curSpeedEle");
  maxScoreEle = document.getElementById("maxScoreEle");
  
  curScore = localStorage.getItem("maxScore");
  curScore = (curScore==null)?0:parseInt(curScore);
  curScoreEle.innerHTML = curScore;
  maxScore = localStorage.getItem("maxScore");
  maxScore = (maxScore==null)?0:parseInt(maxScore);
  maxScoreEle.innerHTML = maxScore;
  curSpeed = localStorage.getItem("curSpeed");
  curSpeed = (curSpeed==null)?1:parseInt(curSpeed);
  curSpeedEle.innerHTML = curSpeed;

  initBlock();  // 随机生成下落方块
  curTimer=setInterval("moveDown();", 500/curSpeed);
  isPlaying=true;
}
