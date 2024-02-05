import {Game} from "./game.js"
import {gti} from "./misc.js"

const timer=gti("timer")
const flags=gti("flags")
const restart=gti("restart")
const win=gti("game")
const modes = gti("modes")
const modal = gti("modal")
const done = gti("done")
const base = [20,10,30]
const form = gti("form")
const params = gti("params")

form.elements["difficult"].forEach(e=>{
	e.addEventListener("click",()=>{
		const [width,height,mines]=game.getDifficult(e.value) ?? base
		form["width"].value=width
		form["height"].value=height
		form["mines"].value=mines
		switchEdit(e.value!="edit")
	})
})

sessionStorage.getItem("difficult") ?? sessionStorage.setItem("difficult","mid")
sessionStorage.getItem("params") ?? sessionStorage.setItem("params","20;10;30")
modes.addEventListener("click",()=>{
	gti(sessionStorage.getItem("difficult")).checked=true
	params.classList.remove("invalid")
	const [width,height,mines]=game.getDifficult(sessionStorage.getItem("difficult")) ?? getParams()
	form["width"].value=width
	form["height"].value=height
	form["mines"].value=mines
	switchEdit(sessionStorage.getItem("difficult")!="edit")
	modal.showModal()
})
done.addEventListener("click",(e)=>{
	e.preventDefault()
	if(!game.validBoard(form["width"].value,form["height"].value,form["mines"].value)){
		params.classList.add("invalid")
		return
	}
	params.classList.remove("invalid")
	sessionStorage.setItem("difficult",form.elements["difficult"].value)
	sessionStorage.setItem("params",`${form["width"].value};${form["height"].value};${form["mines"].value}`)
	game.setBoard(...getParams())
	modal.close()
})

function showFlags(restflags){
	flags.textContent=restflags
}
function showTime(time){
	timer.textContent=`${time}`.padStart(3,'0')
}
function getParams(){
	return [...sessionStorage.getItem("params").split(';')
	.map(e=>parseInt(e))]
}
function switchEdit(force=false){
	form["width"].toggleAttribute("disabled",force)
	form["height"].toggleAttribute("disabled",force)
	form["mines"].toggleAttribute("disabled",force)
}

const game=new Game(win,showTime,showFlags)
if(sessionStorage.getItem("difficult") == "edit"){
	game.setBoard(...getParams())
}
else{
	game.setDifficult(sessionStorage.getItem("difficult"))
}

restart.addEventListener("click",()=>{
	game.restart()
})