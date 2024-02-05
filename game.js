import {random,gti,binary} from "./misc.js"

const states={
	DEFAULT:"default",
	OPEN:"open",
	MARKED:"marked"
}
class Celd{
	#prevState
	#state;
	#mine;
	#id;
	#ui;
	#x;
	#y;
	constructor(x,y){
		this.#mine=false
		this.#state=states.DEFAULT
		this.content=""
		this.#x=x
		this.#y=y
		this.#id=crypto.randomUUID()
		this.#ui=document.createElement("div")
		this.#ui.setAttribute("coords",`${this.#x};${this.#y}`)
		this.#ui.classList.add("celd")
		this.#ui.id=this.#id
		this.#prevState=states.DEFAULT
	}
	render(){
		this.#ui.textContent=this.content
		this.#ui.classList.remove(this.#prevState)
		this.#ui.classList.add(this.#state)
	}


	// setters
	setMine(){
		this.#mine=true	
	}
	unsetMine(){
		this.#mine=false
	}
	open(){
		this.#prevState=this.#state
		this.#state=states.OPEN
		return this.#mine
	}
	mark(){
		if(this.#state==states.DEFAULT){
			this.#prevState=this.#state
			this.#state=states.MARKED
			return 1
		}
		else if(this.#state==states.MARKED){
			this.#prevState=this.#state
			this.#state=states.DEFAULT
			return -1
		}
		return 0
	}

	// getters
	getState(){
		return this.#state
	}
	isMine(){
		return this.#mine
	}
	getId(){
		return this.#id
	}
	getUI(){
		return this.#ui
	}
	getCoords(){
		return {x:this.#x,y:this.#y}
	}
}

export class Game{
	#board;
	#sizeX;
	#sizeY;
	#win;
	#mines;
	#mineMap;
	#firstClick;
	#opens;
	#clock;
	#timer;
	#time;
	#flagCounter;
	#flags;
	#mapNew;
	#difficult;
	constructor(win,clock,flagCounter){
		this.#win=win
		this.#win.addEventListener("contextmenu",e=>e.preventDefault())
		this.#clock=clock
		this.#flagCounter=flagCounter
		this.#board=[]
		this.#difficult=(()=>{
			const {width,height}=document.documentElement.getBoundingClientRect()
			return (height>width?
				{
					"easy":[10,15,10],
					"mid":[10,25,40],
					"hard":[15,30,60]
				}:
				{
					"easy":[15,10,10],
					"mid":[25,10,40],
					"hard":[30,15,60]
				}
			)
		})()
		const observer=new ResizeObserver(entries=>{
			entries.forEach(entry=>{
				this.update()
			})
		})
		observer.observe(document.documentElement)
	}
	#init(sizeX,sizeY,mines){
		this.#endGame()
		if(!this.validBoard(sizeX,sizeY,mines)){
			console.error("not valid board")
			return
		}
		this.#sizeX=sizeX
		this.#sizeY=sizeY
		this.#opens=0
		this.#time=-1
		this.#flags=mines
		this.#mapNew=Array(sizeY).fill([])
		.map(_=>Array(sizeX).fill(true))
		this.#board=Array(sizeY).fill([])
		.map((_,y)=>Array(sizeX).fill(null)
		.map((_,x)=>{
			const celd=new Celd(x,y)
			celd.getUI().addEventListener("mouseup",this.#runner)
			return celd
		}))
		this.#firstClick=true
		this.#mines=mines
		this.#mineMap=[]
		this.render()
		this.#flagCounter(this.#flags)
		this.#setTime()
	}
	setBoard(sizeX,sizeY,mines){
		this.#init(sizeX,sizeY,mines)
	}
	#endGame(){
		for(const i of this.#board){
			for(const j of i){
				j.getUI().removeEventListener("mouseup",this.#runner)
				j.getUI().classList.add("inmutable")
			}
		}
		clearInterval(this.#timer)
	}
	render(){
		this.#win.innerHTML=''
		const fragment=document.createDocumentFragment()
		for(let i=0;i<this.#sizeY;i++){
			const row=document.createElement("div")
			row.classList.add("row")
			for(let j=0;j<this.#sizeX;j++){
				const celd=this.#board[i][j].getUI()
				row.appendChild(celd)
			}
			fragment.appendChild(row)
		}
		for(let i=0;i<this.#sizeY;i++){
			for(let j=0;j<this.#sizeX;j++){
				this.#board[i][j].render()
			}
		}
		this.update()
		this.#win.appendChild(fragment)
	}
	update(){
		const {width,height}=document.documentElement.getBoundingClientRect()
		const h=height/100*70/this.#sizeY
		const w=width/100*70/this.#sizeX
		this.#win.style=`--size:${Math.min(h,w)}px;`
	}
	isValid(x,y){
		return (x>=0 && x<this.#sizeX && y>=0 && y<this.#sizeY)
	}
	validBoard(x,y,m){
		return (x>=4 && x<=60 && y>=4 && y<=60 && m<=x*y-9)
	}
	#setMines(mines,{x,y}){
		const celds=Array(this.#sizeX*this.#sizeY)
		.fill(0).map((_,i)=>i)
		for(const i of [-1,0,1]){
			for(const j of [-1,0,1]){
				if(this.isValid(x+j,y+i)){
					celds.splice(binary(celds,(y+i)*this.#sizeX+(x+j)),1)
				}
			}
		}
		for(let i=0;i<mines;i++){
			const z=random(0,celds.length-1)
			const y=Math.floor(celds[z]/this.#sizeX)
			const x=celds[z]%this.#sizeX
			const celd=this.#board[y][x]
			celd.setMine()
			this.#mineMap.push({x,y})
			celds.splice(z,1)
		}
	}
	#gameWin(){
		this.#endGame()
		for(const i of this.#mineMap){
			const {x,y}=i
			this.#board[y][x].getUI().classList.add("win")
		}
	}
	#gameOver({x,y}){
		this.#endGame()
		for(const i of this.#mineMap){
			const {x,y}=i
			this.#board[y][x].getUI().classList.add("mine")
		}
		this.#board[y][x].getUI().classList.add("dead")
	}
	#open({x,y}){
		let queue=[{x,y}]
		while(queue.length>0){
			const {x,y}=queue[0];
			queue.splice(0,1)
			const celd=this.#board[y][x]
			if(celd.getState()!=states.DEFAULT) continue
			if(celd.isMine()){
				this.#gameOver({x,y})
				return
			}
			const counter=this.#countMines({x,y})
			celd.open()
			this.#opens++;
			if(counter==0){
				for(const i of [-1,0,1]){
					for(const j of [-1,0,1]){
						const [nx,ny]=[x+j,y+i]
						if(this.isValid(nx,ny))
						if(this.#mapNew[ny][nx]){
							this.#mapNew[ny][nx]=false
							queue.push({x:x+j,y:y+i})
						}
					}
				}
			}
			else{
				celd.getUI().style.setProperty('--n',`var(--n${counter})`)
				celd.content=counter
			}
			celd.render()
		}
	}
	#runner=(e)=>{
		const [x,y]=e.target.getAttribute("coords").split(';')
		.map(i=>parseInt(i))
		const celd=this.#board[y][x]
		if(celd.getState()==states.OPEN) return
		if(e.button==0 && celd.getState()!=states.MARKED){
			if(this.#firstClick){
				this.#firstClick=false
				this.#setMines(this.#mines,{x,y})
				this.#timer=setInterval(this.#setTime,1000)
			}
			this.#open({x,y})
			if(this.#opens>=this.#sizeX*this.#sizeY-this.#mines){
				this.#gameWin()
			}
		}
		if(e.button==2){
			this.#flags-=celd.mark()
			this.#flagCounter(this.#flags)
			celd.render()
		}
	}
	restart(){
		this.#init(this.#sizeX,this.#sizeY,this.#mines)
	}
	setDifficult(difficult){
		if(this.#difficult[difficult]){
			this.setBoard(...this.#difficult[difficult])
		}
	}
	getDifficult(difficult){
		return this.#difficult[difficult]
	}
	#countMines({x,y}){
		let counter=0
		for(const i of [-1,0,1]){
			for(const j of [-1,0,1]){
				if(this.isValid(x+j,y+i))
				if(this.#board[y+i][x+j].isMine()) counter++
			}
		}
		return counter
	}
	#setTime=()=>{
		this.#time++
		if(this.#time>999){
			this.#endGame()
			alert("¡to much time!")
			return
		}
		this.#clock(this.#time)
	}
}
