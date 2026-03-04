const boardElement = document.getElementById("board");
const difficultySelect = document.getElementById("difficulty");
const timerDisplay = document.getElementById("timer");
const bestDisplay = document.getElementById("best");
const hintsDisplay = document.getElementById("hints");
const message = document.getElementById("message");

let solution=[], puzzle=[];
let seconds=0, timerInterval=null;
let hintsLeft=3;

function createEmptyBoard(){
  return Array.from({length:9},()=>Array(9).fill(0));
}

function isSafe(board,row,col,num){
  for(let i=0;i<9;i++){
    if(board[row][i]===num) return false;
    if(board[i][col]===num) return false;
  }
  let br=Math.floor(row/3)*3;
  let bc=Math.floor(col/3)*3;
  for(let r=br;r<br+3;r++)
    for(let c=bc;c<bc+3;c++)
      if(board[r][c]===num) return false;
  return true;
}

function solve(board){
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(board[r][c]===0){
        let nums=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
        for(let n of nums){
          if(isSafe(board,r,c,n)){
            board[r][c]=n;
            if(solve(board)) return true;
            board[r][c]=0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSolution(){
  let board=createEmptyBoard();
  solve(board);
  return board;
}

function removeNumbers(board,count){
  let b=board.map(r=>[...r]);
  while(count>0){
    let r=Math.floor(Math.random()*9);
    let c=Math.floor(Math.random()*9);
    if(b[r][c]!==0){
      b[r][c]=0;
      count--;
    }
  }
  return b;
}

function drawBoard(){
  boardElement.innerHTML="";
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const cell=document.createElement("input");
      cell.classList.add("cell");
      cell.maxLength=1;

      if(c%3===0) cell.classList.add("thick-left");
      if(r%3===0) cell.classList.add("thick-top");
      if(c===8) cell.classList.add("thick-right");
      if(r===8) cell.classList.add("thick-bottom");

      if(puzzle[r][c]!==0){
        cell.value=puzzle[r][c];
        cell.disabled=true;
        cell.classList.add("fixed");
      }

      cell.dataset.row=r;
      cell.dataset.col=c;
      cell.addEventListener("input",()=>handleInput(cell,r,c));

      boardElement.appendChild(cell);
    }
  }
}

function handleInput(cell,row,col){
  let val=parseInt(cell.value);
  if(!val||val<1||val>9){cell.value="";return;}
  if(val!==solution[row][col]){cell.value="";return;}
  checkWin();
}

function checkWin(){
  for(let r=0;r<9;r++)
    for(let c=0;c<9;c++){
      const v=document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`).value;
      if(parseInt(v)!==solution[r][c]) return;
    }
  clearInterval(timerInterval);
  saveBestTime();
  message.innerText="🎉 ניצחת! זמן: "+formatTime(seconds);
}

function startTimer(){
  clearInterval(timerInterval);
  seconds=0;
  timerInterval=setInterval(()=>{
    seconds++;
    timerDisplay.innerText=formatTime(seconds);
  },1000);
}

function formatTime(sec){
  let m=Math.floor(sec/60).toString().padStart(2,"0");
  let s=(sec%60).toString().padStart(2,"0");
  return m+":"+s;
}

function saveBestTime(){
  let diff=difficultySelect.value;
  let key="best_"+diff;
  let best=localStorage.getItem(key);
  if(!best||seconds<best){
    localStorage.setItem(key,seconds);
  }
  loadBestTime();
}

function loadBestTime(){
  let diff=difficultySelect.value;
  let best=localStorage.getItem("best_"+diff);
  bestDisplay.innerText=best?formatTime(parseInt(best)):"--:--";
}

function useHint(){
  if(hintsLeft<=0) return;
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      const cell=document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
      if(!cell.value){
        cell.value=solution[r][c];
        hintsLeft--;
        hintsDisplay.innerText=hintsLeft;
        checkWin();
        return;
      }
    }
  }
}

function newGame(){
  message.innerText="";
  solution=generateSolution();
  puzzle=removeNumbers(solution,parseInt(difficultySelect.value));
  hintsLeft=3;
  hintsDisplay.innerText=hintsLeft;
  drawBoard();
  startTimer();
  loadBestTime();
}

newGame();