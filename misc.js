export const qs = sel => document.querySelector(sel)
export const qsa = sel => document.querySelectorAll(sel)
export const gti = sel => document.getElementById(sel)
export const gtg = sel => document.getElementsByTagName(sel)

export function random(min,max){
	[min,max]=[parseInt(min),parseInt(max)]
	if(min>max){[min,max]=[max,min]}
	max++
	return Math.floor(Math.random()*(max-min)+min)
}

export function binary(a,n){ 
	let l=0,r=a.length-1;
	let half; 
	while(r>=l){
		half=Math.floor((r-l)/2)+l;
		if(a[half]==n){
			return half;
		}
		a[half]<n?l=half+1:r=half-1;
	}
	return -1;
}