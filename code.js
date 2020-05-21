const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//grid dimensions
var rows = 6;
var cols = 7;
var width  = document.getElementById("canvas").width;
var height = document.getElementById("canvas").height;

//space between rows and cols
var dx = parseInt(width/cols);
var dy = parseInt(height/rows);

var radius = 15; //bead radius
var grid =[]; //grid of beads. 0 entry for red player, 1 for blue player

var xRem = rows*cols; //remaining cells in grid
var beads=[]; //array of bead objects
var prevCol=0; //column that got highlighted last
var activePlayer = 0; //0(red) or 1(blue)
var winCells =[]; //[x,y], winning cells
var winCol = "green";
var highCol = "yellow";
var blueScore = 0;
var redScore  = 0;
var round = 1;
var roundOver = false;
var gameOver = false;
var p1Col = "red"; //default color
var p2Col = "blue"; //default color
var rName="Bob"; //default name
var bName="Ross"; //default name
var dums = false; //true if there has been at least a draw, false otherwise
var draws=0; //amount of draws

var Prompt = new customPrompt();
var Alert = new customAlert();

//bead class
function Bead(x,y,color){
	this.x=x;
	this.y=y;
	this.color=color;
}

//initialize arrays and variables
function initGame(){
	if(!roundOver)
		Prompt.render();
	initGrid();
	initBeads();
	winCells=[];
	xRem = rows*cols;
	roundOver=false;
	document.getElementById("round").innerHTML="Round: "+round;
	
}

//load round 
function onLoad(){
		
		ctx.beginPath();
		ctx.rect(0,0,width,height);
		ctx.stroke();
		drawLines();
		initGame();
		printGrid();
}

//creates a custom alert pop-up
function customAlert(){
	this.render = function(dialog, op){
		let winW = window.innerWidth;
		let winH = window.innerHeight;
		let dialogOverlay = document.getElementById("dialogoverlay");
		let dialogbox = document.getElementById("dialogbox");
		dialogOverlay.style.display = "block";
		dialogoverlay.style.height = winH+"px";
		dialogbox.style.left = (winH/2)+"px";
		dialogbox.style.top="10px";
		dialogbox.style.display="block";
		document.getElementById("dialogboxhead").innerHTML = "Attention: ";
		document.getElementById("dialogboxbody").innerHTML = dialog;
		document.getElementById("dialogboxfoot").innerHTML = "<button onclick = \"Alert.ok('"+op+"')\">OK</button>";
		
	}
	
	this.ok = function(op){
		document.getElementById("dialogbox").style.display = "none";
		document.getElementById("dialogoverlay").style.display = "none";
		if(op=="__messedUp__")
			messedUp();
		if(op=="__yugi__"){
			document.getElementById("body").innerHTML='<h1 style = "margin-bottom:-20px">Score 2!</h1>';
			document.getElementById("body").innerHTML+='<br><button style ="margin-bottom:5px" type = "button" onclick = "restart()">Restart</button>';
			document.getElementById("body").innerHTML+='<br><img src="yugi.jpg" alt="It\'s a Draw" style="width:490px;height:420px;">'
		}
		if(op=="__kill__"){
			var win = window.open('https://www.youtube.com/watch?v=g67YbCq6460', '_blank');
			win.focus();
		}
			
	}
	
}



//created custom prompyt
function customPrompt(){
	this.render = function(){
		let winW = window.innerWidth;
		let winH = window.innerHeight;
		let dialogOverlay = document.getElementById("dialogoverlay");
		let dialogbox = document.getElementById("dialogbox");
		dialogOverlay.style.display = "block";
		dialogoverlay.style.height = winH+"px";
		dialogbox.style.left = (winH/2)+"px";
		dialogbox.style.top="100px";
		dialogbox.style.display="block";
		document.getElementById("dialogboxhead").innerHTML = "Message: ";
		document.getElementById("dialogboxbody").innerHTML = "Player 1 name:";
		document.getElementById("dialogboxbody").innerHTML += '<br><input id = "name1">';
		document.getElementById("dialogboxbody").innerHTML += '<input style = "margin-left: 20px" type = "color" id = "color1" value = "#ff0000">';
		document.getElementById("dialogboxbody").innerHTML += '<br><br>Player 2 name: ';
		document.getElementById("dialogboxbody").innerHTML += '<br><input id = "name2">';
		document.getElementById("dialogboxbody").innerHTML += '<input style = "margin-left: 20px;" type = "color" id = "color2" value = "#0000ff">';
		document.getElementById("dialogboxfoot").innerHTML = "<button onclick = \"Prompt.ok()\">OK</button>";
	}
	//choose name and colors
	this.ok = function(){
		document.getElementById("dialogbox").style.display = "none";
		document.getElementById("dialogoverlay").style.display = "none";
		let rN = document.getElementById("name1").value;
		let bN = document.getElementById("name2").value;
		let rC = document.getElementById("color1").value;
		let bC = document.getElementById("color2").value;
		if(rN!="")
			rName = rN;
		if(bN!="")
			bName = bN;
		//if both picked the same color goto call __messedUp__ functionality
		if(rC==bC){
			Alert.render("Well, you're both dumb so there you go: ","__messedUp__");
			
		}
		else{
			p1Col = rC;
			p2Col = bC;
			document.getElementById("red").style = "color: "+p1Col;
			document.getElementById("blue").style = "color: "+p2Col;
			document.getElementById("red").innerHTML=rName+": 0";
			document.getElementById("blue").innerHTML=bName+": 0";
		}
	}
}

//initialize grid
//all entries are 'x'
//'x' signifies emptiness
function initGrid(){
	grid=[];
	let tempRow=[];
	for(let r=0; r<rows; r++){
		tempRow=[]
		for(let c=0; c<cols; c++){
			tempRow.push('x');
		}
		grid.push(tempRow);

	}
}

//initialize bead table
//all entries are 'x'
//'x' signifies emptiness
function initBeads(){
	let tempRow=[];
	beads=[];
	for(let r=0; r<rows; r++){
		tempRow=[]
		for(let c=0; c<cols; c++){
			tempRow.push('x');
		}
		beads.push(tempRow);

	}
	
}

//draw all grid lines
function drawLines(){
	let x=0;
	let y=0;
	
	//verical lines
	for(let i=0;i<cols;i++){
		y=0;
		x=(i+1)*dx;
		drawLine(x,y,x,height);
		x=0;
		y=(i+1)*dy;
		drawLine(x,y,width,y);
	}
	
}

//draw line from (xF, yF) to (xT, yT)
function drawLine(xF, yF, xT, yT){
	ctx.beginPath();
	ctx.moveTo(xF, yF);
	ctx.lineTo(xT, yT);
	ctx.stroke();
	
}

//higlight a column
function highlightCol(col){
	for(let r=0; r<rows; r++){
			ctx.globalAlpha=.2;
			ctx.beginPath();
			ctx.fillStyle="yellow";
			ctx.rect(col*dx+1,r*dy+1,dx-2,dy-2);
			ctx.fill();
			ctx.globalAlpha=1;
	}
	paintWinCells();
	// for(let r=0; r<rows; r++){
				// if(grid[r][col]==1 || grid[r][col] == 0 || grid[r][prevCol] == 1 || grid[r][prevCol] == 0){
					// drawBead(r,col, beads[r][col].color);
				// }
	// }
	drawAllBeads();
	
}

//draw all beads placed so far
function drawAllBeads(){
	for(let r=0; r<rows; r++){
		for(let c = 0; c<cols; c++){
				if(grid[r][c]==1 || grid[r][c] == 0 ){
					drawBead(r,c, beads[r][c].color);
				}
		}
	}
}

//unhilight already highlighted column
function unHighlightCol(){
	for(let r=0; r<rows; r++){
		ctx.clearRect(prevCol*dx+1,r*dy+1,dx-2,dy-2);
	}
	paintWinCells();
	// for(let r=0; r<rows; r++){
		
				// if(grid[r][prevCol]==1 || grid[r][prevCol] == 0){
					// drawBead(r,prevCol, beads[r][prevCol].color);
				// }
			
	// }
	drawAllBeads();
}

//mouse move function
function mousemove(event){
	let mouseX = event.clientX;
	for(let i=0; i<cols; i++){
		//determine which cell the mouse is hovering
		if(mouseX >=i*dx && mouseX<= (i+1)*dx){
			//paintWinCells();
			unHighlightCol(); //unhighlight previously highlighted column
			highlightCol(i); //highlight the column the mouse is on
			
			prevCol=i; //set new highlighted column
			break;
		}
	}
}

function mousedown(event){
	event.preventDefault();
}

//mouse click handler
function mouseclick(event){
	event.preventDefault();
	let mouseX = event.clientX; //mouse x-position
	if(event.button==0 && !roundOver){
		if(!colFull(prevCol)){ //if highlighted column is not full
			placeBead(prevCol); //place bead in said column
		}
		printGrid();
		
	}
}

//check if a column is full
function colFull(prevCol){
	
	for(let i=0; i<rows; i++){
		if(grid[i][prevCol]=='x')
			return false;
	}
	
	return true;
	
}

//place a bead in a column
function placeBead(col){
	let r=rows-1;
	let color;
	//check last bead in col
	for(r=rows-1; r>-1; r--){
		if(grid[r][col]=='x'){ //check next empty cell in given column
			grid[r][col]=0; //default player
			color = p1Col;
			if(activePlayer==1){ //if activeplayer is 1 change coclor and grd value
				color=p2Col;
				grid[r][col]=1;
			}
			beads[r][col]=new Bead((col+1/2)*dx, (r+1/2)*dy, color); //create new bead and place in bead grid
			console.log("xRem: "+xRem);
			xRem--;
			break;
		}
	}
	drawBead(r, col, color);
	if(!checkWin(r,col, color)){ //if there's no winner yet
		console.log("xReeeem: "+xRem);
		if(gridIsFull()){ //handle draw
			roundOver=true;
			draws++;
			//handle draws
			if(draws==1)
				Alert.render("How did you do that? It's a draw. Aaaaaand I'm taking a point from each of you cuz you're dum-dums.","__draw__");
			else if(draws ==2)
				Alert.render("Again? What's wrong with you? That's -2 for each..","__draw__");
			else if(draws == 3)
				Alert.render("... This is getting old. Are you mocking me?","__draw__");
			else if(draws == 4){
				Alert.render("Now that's just embarasing.. We'll there's only one thing appropriate for both of you.","__kill__");
			}
			blueScore-=draws;
			redScore-=draws;
			dums = true;
			updateScore();
			
			
		}
	}
	//paintWinCells();
	activePlayer=(activePlayer+1)%2; //change player
	
}

//check if grid is full
function gridIsFull(){
	if(xRem==0)
		return true;
	return false;
}

//draw a bead on given row(r), column(col) and of the given color
function drawBead(r,col, color){
	ctx.beginPath();
	ctx.arc((col+1/2)*dx, (r+1/2)*dy, radius,0, 2*Math.PI, false);
	ctx.fillStyle=color;
	ctx.fill();
	//paintWinCells();
	//beads[r][col]=new Bead((col+1/2)*dx, (r+1/2)*dy, color);
}

//print grid in console
function printGrid(){
	let row = " ";
	for(let r=0; r<rows; r++){
		row=" ";
		for(let c=0; c<cols; c++){
			row=row.concat(grid[r][c]);
			//console.log(toString(grid[r][c]));
		}
		console.log(row);
	}
}


//check if current player won
function checkWin(x,y,color){
	let cur = grid[x][y];
	//alert(x+","+y);
	//get player
	let p=0;
	if(color == p2Col)
		p=1;
	let score = 0; //score to add
	let l = max(checkLine(x,y,p)-3,0); //line score
	let c = max(checkColumn(x,y,p)-3,0); //column score
	let pr = max(checkPrimDiag(x,y,p)-3,0); //prime diagonal score
	let s = max(checkSecDiag(x,y,p)-3,0); //secondary diagonal score
	
	//check how many win conditions were met
	let sA=[l,c,pr,s];
	let fours=0; //win conditions
	for(let i = 0 ; i<sA.length; i++){
		console.log("SA: "+sA[i]);
		if(sA[i]>0){
			roundOver = true;
			score+=sA[i];//line plus extra beads
			fours++; //add win condition
		}
	}
	console.log("score: "+score);
	if(fours>1)
		score+=1; //mult lines
	if(fours==sA.length)
		score++;//all lines
	
	if(roundOver){
		if(color == p1Col)
			redScore+=score;
		else{
			blueScore+=score;
		}
		updateScore();
		announceRoundWinner(color);
		return true;
	}
	
	return false;
}

//update scores in screen
function updateScore(){
	
	document.getElementById("red").innerHTML=rName+": "+redScore;
	document.getElementById("blue").innerHTML=bName+": "+blueScore;
			
}

//checks line(x), starting from position y
//to find beads in a row of color p
//if 4 or more are found in a row return that number 0 otherwise
function checkLine(x,y,p){
	let ar = []
	//horizontal check
	let b = max(y-3,0);
	let f = min(cols-1, y+3);
	let curF=0;
	let tmpAr = [];
	let found = 0;
	console.log(p,x);
	for(let i=0;i<=cols-1;i++){
		console.log("x: "+x + " y:"+i+" g: "+grid[x][i]+" p:"+p+" found:"+curF );
		if(grid[x][i]==p){
			tmpAr.push([x,i]);
			curF++;
		}
		else{
			if(curF>found){
				ar=tmpAr;
				found=curF;
			}
			if(curF<4)
				tmpAr=[];
			curF = 0;
		}
	}
	if(curF>found){
		ar = tmpAr;
		found=curF;
	}
	if(found>=4){
			console.log(ar);
			winCells=winCells.concat(ar);
			console.log(winCells);
			return found;//found winner
	}
	ar=[];
	return 0;
}

//checks column(y), starting from position x
//to find beads in a row of color p
//if 4 or more are found in a row return that number 0 otherwise
function checkColumn(x,y,p){
	let ar=[]
	//search from the bottom up
	//if checking from position 3+ a win position in columns can't be met
	if(x<3){
		let found = 0; //beads of the same color found in a row
		for(let i = x; i<rows; i++){
			console.log("x: "+i + " y:"+y+" g: "+grid[i][y]+" p:"+p+" found:"+found );
			if(grid[i][y]==p){
				ar.push([i,y]);
				found++;
			}
			else{ //streak broke
				break;
			}
		}
		
		if(found>=4){
				winCells=winCells.concat(ar);
				return found;
		}
		
		
	}
	return 0;
		
}


//checks the prime diagonal, starting from position (x,y)
//to find beads in a row of color p
//if 4 or more are found in a row return that number 0 otherwise
function checkPrimDiag(x,y,p){
	let ar=[]; //array of beads found
	let found = 0;
	//back
	let y0 = y;
	//check lower part of diagonal
	for(let x0=x; x0>=0; x0--){
		
		if(y0<0)
			break;
		if(grid[x0][y0] == p){
			ar.push([x0,y0]);
			found++;
		}
		else
			break;
		y0--;
	}
	
	//check upper part of diagonal
	y0=y+1;
	for(let x0=x+1; x0<rows; x0++){
		if(y0>cols)
			break;
		if(grid[x0][y0] == p){
			ar.push([x0,y0]);
			found++;
		}
		else
			break;
		y0++;
	}
	if(found >= 4){
		winCells=winCells.concat(ar);
		return found;
	}
	ar=[];
	return 0;
}


//checks the secondary diagonal, starting from position (x,y)
//to find beads in a row of color p
//if 4 or more are found in a row return that number 0 otherwise
function checkSecDiag(x,y,p){
	let ar =[]; //array of beads found
	let found = 0;
	//check lower part of diagonal
	let y0 = y;
	for(let x0=x; x0<rows; x0++){
		if(y0<0)
			break;
		if(grid[x0][y0] == p){
			ar.push([x0,y0]);
			found++;
		}
		else
			break;
		y0--;
	}
	
	//check upper part of diagonal
	y0=y+1;
	for(let x0=x-1; x0>=0; x0--){
		if(y0>cols)
			break;
		if(grid[x0][y0] == p){
			ar.push([x0,y0]);
			found++;
		}
		else
			break;
		y0++;
	}
	if(found >= 4){
		winCells=winCells.concat(ar);
		return found;
	}
	ar = [];
	return 0;
}


//paint winning cells
//paint them yellow-ish
function paintWinCells(){
	for(let i=0;i<winCells.length;i++){
		drawCell(winCells[i][1]*dy,winCells[i][0]*dx,"#90EE90");
	}
}

//draw a cell in position (x,y) of given color
function drawCell(x,y,color){
	let sideX = dx-2;
	let sideY = dy-2;
	ctx.beginPath();
	ctx.fillStyle=color;
	ctx.rect(x+1,y+1,sideX,sideY);
	ctx.fill();
	
}

//find max of 2 numbers
function max(a,b){
	if(a>b)
		return a;
	return b;
}

//find min of two numbers
function min(a,b){
	if(a>b)
		return b;
	return a;
}


//announce final winner and winning condition
//(might not use)
function announceWinner(cond){
	let w="Red";
	if(activePlayer==1)
		w="Blue";
	alert(w+" player wins by "+cond);
}

//reload page
function restart(){
	document.location.reload();
}

//initiate next round
function nextRound(){
	if(roundOver){
		//game over after 4 rounds
		if(round==4){
			gameOver=true;
			announceWinner();
		}
		//clear all
		else{
			round++;
			cleanCanvas();
			onLoad(); //redraw everything
		}
	}
}

//clear all lines and cells
function cleanCanvas(){
	ctx.clearRect(0,0,width,height);
}

//announce round winner 
function announceRoundWinner(color){
	let winner = rName;
	if(color == p2Col)
		winner = bName;
	Alert.render('<span style = "color:'+color+'">'+winner+'</span>'+" won this round! Click the \"Next Round\" button to proceed to the next round.",0);
	
}

function announceWinner(){
	//handle draw
	if(blueScore == redScore){
		//if they have tied before
		if(dums)
			Alert.render("You dum dums...","__yugi__");
		
		else{
			document.getElementById("body").innerHTML='<h1 style = "margin-bottom:-20px">Score 2!</h1>';
			document.getElementById("body").innerHTML+='<br><button style ="margin-bottom:5px" type = "button" onclick = "restart()">Restart</button>';
			document.getElementById("body").innerHTML+='<br><img src="yugi.jpg" alt="It\'s a Draw" style="width:490px;height:420px;">';
		}
	}
	//handle winner
	else{
		//red is default winner
		let winner = rName;
		let wCol = p1Col;
		let loser = bName;
		let lCol = p2Col;
		//if blue wins, change 
		if(blueScore>redScore){
			winner = bName;
			wCol = p2Col;
			loser = rName;
			lCol = p2Col;
		}
		let dialog = '<p><span style = "color:'+wCol+'" >'+winner+'</span> wins! Congrats on your Victory!</p><br><p>Don\'t worry <span style = "color:'+lCol+'">'+loser+'</span>, we still love you! Collect the knowledge from this loss and win next time!</p>'
		if(dums)
			dialog+='<p>(Even though you\'re both dum-dums)</p>'
		Alert.render(dialog,0);
	}
}


//goto link for multiple draws
function messedUp(){
		document.getElementById("body").innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/ea4T5xP2nKA?&autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
}



