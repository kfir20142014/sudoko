const boardEl=document.getElementById("board");
const diffEl=document.getElementById("difficulty");
const timerEl=document.getElementById("timer");
const bestEl=document.getElementById("best");
const hintsEl=document.getElementById("hints");
const messageEl=document.getElementById("message");

let solution=[], puzzle=[];
let seconds=0, timer=null;
let hints=3;

function emptyBoard(){
  return Array.from({length:9},()=>Array(9).fill(0));
}

function valid(board,r,c,n){
  for(let i=0;i<9;i++){
    if(board[r][i]==n||board[i][c]==n) return false;
  }
  let br=Math.floor(r/3)*3;
  let bc=Math.floor(c/3)*3;
  for(let i=br;i<br+3;i++)
    for(let j=bc;j<bc+3;j++)
      if(board[i][j]==n) return false;
  return true;
}

function solve(board){
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      if(board[r][c]==0){
        let nums=[1,2,3,4,5,6,7,8,9].sort(()=>Math.random()-0.5);
        for(let n of nums){
          if(valid(board,r,c,n)){
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

function generate(){
  let b=emptyBoard();
  solve(b);
  return b;
}

function removeNums(board,count){
  let b=board.map(r=>[...r]);
  while(count>0){
    let r=Math.floor(Math.random()*9);
    let c=Math.floor(Math.random()*9);
    if(b[r][c]!=0){
      b[r][c]=0;
      count--;
    }
  }
  return b;
}

function draw(){
  boardEl.innerHTML="";
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      let cell=document.createElement("input");
      cell.className="cell";
      cell.maxLength=1;

      if(c%3==0) cell.classList.add("thick-left");
      if(r%3==0) cell.classList.add("thick-top");
      if(c==8) cell.classList.add("thick-right");
      if(r==8) cell.classList.add("thick-bottom");

      if(puzzle[r][c]!=0){
        cell.value=puzzle[r][c];
        cell.disabled=true;
        cell.classList.add("fixed");
      }

      cell.dataset.r=r;
      cell.dataset.c=c;

      cell.addEventListener("input",()=>{
        let val=parseInt(cell.value);
        if(!val||val<1||val>9) cell.value="";
      });

      boardEl.appendChild(cell);
    }
  }
}

function checkBoard(){
  let correct=true;

  document.querySelectorAll(".cell").forEach(cell=>{
    if(cell.disabled) return;

    let r=cell.dataset.r;
    let c=cell.dataset.c;
    let val=parseInt(cell.value);

    cell.classList.remove("correct","wrong");

    if(!val){
      correct=false;
      return;
    }

    if(val==solution[r][c]){
      cell.classList.add("correct");
    } else {
      cell.classList.add("wrong");
      correct=false;
    }
  });

  if(correct){
    clearInterval(timer);
    messageEl.innerText="🎉 הכל נכון!";
    saveBest();
  } else {
    messageEl.innerText="❌ יש טעויות";
  }
}

function useHint(){
  if(hints<=0) return;
  for(let r=0;r<9;r++){
    for(let c=0;c<9;c++){
      let cell=document.querySelector(`.cell[data-r='${r}'][data-c='${c}']`);
      if(!cell.value){
        cell.value=solution[r][c];
        hints--;
        hintsEl.innerText=hints;
        return;
      }
    }
  }
}

function startTimer(){
  clearInterval(timer);
  seconds=0;
  timer=setInterval(()=>{
    seconds++;
    timerEl.innerText=format(seconds);
  },1000);
}

function format(s){
  let m=Math.floor(s/60).toString().padStart(2,"0");
  let sec=(s%60).toString().padStart(2,"0");
  return m+":"+sec;
}

function saveBest(){
  let key="best_"+diffEl.value;
  let best=localStorage.getItem(key);
  if(!best||seconds<best){
    localStorage.setItem(key,seconds);
  }
  loadBest();
}

function loadBest(){
  let best=localStorage.getItem("best_"+diffEl.value);
  bestEl.innerText=best?format(parseInt(best)):"--:--";
}

function newGame(){
  messageEl.innerText="";
  solution=generate();
  puzzle=removeNums(solution,parseInt(diffEl.value));
  hints=3;
  hintsEl.innerText=hints;
  draw();
  startTimer();
  loadBest();
}

newGame();