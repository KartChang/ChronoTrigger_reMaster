/** Physical keyboard ownership; browser defaults must not activate a second command. */
export const MOVEMENT_CODES=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'] as const;
export const UI_CODES=['Enter','Space','KeyE','Escape','KeyI','KeyH','Digit1','Digit2'] as const;
export function physicalCode(e:Pick<KeyboardEvent,'code'|'key'>):string{
 if(e.code&&e.code!=='Unidentified')return e.code;
 if(/^[a-z]$/i.test(e.key))return 'Key'+e.key.toUpperCase();
 return ({' ':'Space',',':'Comma','.':'Period','/':'Slash','\\':'Backslash','[':'BracketLeft',']':'BracketRight','1':'Digit1','2':'Digit2'} as Record<string,string>)[e.key]??e.key;
}
export function editableTarget(target:EventTarget|null):boolean{
 if(!(target instanceof HTMLElement))return false;
 if(target.isContentEditable||target instanceof HTMLTextAreaElement||target instanceof HTMLSelectElement)return true;
 return target instanceof HTMLInputElement&&!['button','submit','reset','file','checkbox','radio','hidden'].includes(target.type);
}
export function keyboardVectors(held:(key:string)=>boolean,solo:boolean):[{x:number;z:number},{x:number;z:number}]{
 const arrows={x:Number(held('ArrowRight'))-Number(held('ArrowLeft')),z:Number(held('ArrowUp'))-Number(held('ArrowDown'))};
 return [{x:Number(held('KeyD'))-Number(held('KeyA'))+(solo?arrows.x:0),z:Number(held('KeyW'))-Number(held('KeyS'))+(solo?arrows.z:0)},solo?{x:0,z:0}:arrows];
}
