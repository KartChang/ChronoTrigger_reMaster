import {ART_PROFILE} from './art-profile';
/** Reconstructed trial/prison slice. Layouts and balance are authored, not ROM data. */
export type TrialMap='guardia1000'|'hall1000'|'courtroom'|'cellblock'|'execution'|'prisonstairs'|'warden'|'prisonbridge'|'futuregate';
export type TrialStage='none'|'escort'|'court'|'cell'|'escape'|'tank'|'flight'|'future';
export type TrialChoice='collision'|'wealth'|'wait'|null;
export type Verdict='pending'|'guilty'|'not-guilty';
export type Trial={
 stage:TrialStage; history:string|null; fade:number; choice:TrialChoice; question:0|1|2|3;
 blamedMarle:boolean|null; wealthMotive:boolean|null; verdict:Verdict; knocks:number; days:number;
 route:'unknown'|'breakout'|'wait'; cellOpen:boolean; guardsWon:boolean; fritzFreed:boolean;
 luccaJoined:boolean; marleJoined:boolean; manualRead:boolean; suppliesTaken:boolean; tankWon:boolean;
 encounter:'none'|'cellguards'|'stairguards'|'tank'; ethers:number; experience:number; headRepairs:number;
};
export const newTrial=():Trial=>({stage:'none',history:null,fade:0,choice:null,question:0,blamedMarle:null,wealthMotive:null,verdict:'pending',knocks:0,days:0,route:'unknown',cellOpen:false,guardsWon:false,fritzFreed:false,luccaJoined:false,marleJoined:false,manualRead:false,suppliesTaken:false,tankWon:false,encounter:'none',ethers:0,experience:0,headRepairs:0});
export const TRIAL_NAMES:Record<TrialMap,string>={guardia1000:'加爾迪亞森林 · 1000 年',hall1000:'加爾迪亞王城 · 1000 年',courtroom:'王國法庭',cellblock:'空中刑務所 · 獨房',execution:'空中刑務所 · 處刑室',prisonstairs:'空中刑務所 · 階梯塔',warden:'空中刑務所 · 看守室',prisonbridge:'空中刑務所 · 吊橋',futuregate:'2300 年 · 班哥巨蛋'};
export const trialMap=(x:string):x is TrialMap=>Object.hasOwn(TRIAL_NAMES,x);
export const WORLD_GUARDIA={x:-2.9,z:4.5};
export const TANK_PART_NAMES={tankHead:'龍戰車 · 頭部',tankBody:'龍戰車 · 車體',tankWheel:'龍戰車 · 車輪'} as const;
export const TANK_PARTS=[{kind:'tankHead' as const,x:-1.6,z:.4,hp:240},{kind:'tankBody' as const,x:-4,z:.4,hp:200},{kind:'tankWheel' as const,x:-3.8,z:-.55,hp:160}];
export const TRIAL_SOLIDS:Partial<Record<TrialMap,ReadonlyArray<{x:number;z:number;w:number;d:number}>>>= {
 courtroom:[{x:-5,z:2,w:2.3,d:5.2},{x:5,z:2,w:2.3,d:5.2},{x:0,z:5,w:5,d:1.5}],
 cellblock:[{x:-4.5,z:-.4,w:6.2,d:.12},{x:4.5,z:-.4,w:6.2,d:.12},{x:-4.8,z:-4,w:2,d:2.6},{x:-5,z:4,w:2.3,d:2.4}],
 execution:[{x:3.8,z:2,w:1.9,d:2.4},{x:-4,z:3,w:2.5,d:1.5}],
 warden:[{x:3.7,z:2,w:2.4,d:1.5}],
 hall1000:[{x:-5,z:2,w:1.1,d:3},{x:5,z:2,w:1.1,d:3}],
 futuregate:[{x:-4.5,z:1,w:2.5,d:3},{x:4.3,z:1.8,w:2.5,d:3}],
};
export function trialWalkable(x:number,z:number,map:TrialMap):boolean{
 if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>7.5||Math.abs(z)>6.6)return false;
 if(map==='prisonbridge'&&Math.abs(z)>ART_PROFILE.bridge.deckHalfDepth-ART_PROFILE.bridge.actorMargin)return false;
 if(map==='prisonstairs'&&Math.abs(x)>3.2&&Math.abs(z)<2.3)return false;
 if(map==='guardia1000'&&Math.abs(x)>3.2&&z<1.1)return false;
 return !(TRIAL_SOLIDS[map]??[]).some(o=>Math.abs(x-o.x)<o.w/2+.22&&Math.abs(z-o.z)<o.d/2+.22);
}
export function trialStageAllows(t:Trial,chapter:string):boolean{
 const maps:Record<Exclude<TrialStage,'none'>,string[]>={escort:['overworld1000','guardia1000','hall1000'],court:['courtroom'],cell:['cellblock'],escape:['cellblock','execution','prisonstairs'],tank:['warden','prisonbridge','prisonstairs','execution','cellblock'],flight:['prisonbridge','hall1000','guardia1000'],future:['futuregate']};
 return t.stage!=='none'&&maps[t.stage].includes(chapter);
}
