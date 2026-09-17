/** Deterministic, bounded local pathfinding. Reuses the game's actual collision query. */
export type Point={x:number;z:number};
export type CollisionQuery=(x:number,z:number)=>boolean;
export type Route={points:Point[];visited:number;reason:'arrived'|'found'|'unreachable'|'budget'|'invalid'};
const GRID=.5,MIN_X=-14,MAX_X=14,MIN_Z=-10,MAX_Z=12;
const dist=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.z-b.z);
const finite=(p:Point)=>Number.isFinite(p.x)&&Number.isFinite(p.z)&&p.x>=MIN_X&&p.x<=MAX_X&&p.z>=MIN_Z&&p.z<=MAX_Z;
const key=(x:number,z:number)=>`${x},${z}`;
export function visibleSegment(a:Point,b:Point,walkable:CollisionQuery):boolean {
 if(!finite(a)||!finite(b))return false;
 const n=Math.max(1,Math.ceil(dist(a,b)/.125));
 for(let i=0;i<=n;i++)if(!walkable(a.x+(b.x-a.x)*i/n,a.z+(b.z-a.z)*i/n))return false;
 return true;
}
/** Finds a collision-safe route to within radius of the leader, never teleports. */
export function findRoute(from:Point,to:Point,walkable:CollisionQuery,radius=1.4,maxNodes=1800):Route {
 if(!finite(from)||!finite(to)||!Number.isFinite(radius)||radius<0||radius>3||!Number.isInteger(maxNodes)||maxNodes<1||maxNodes>4096||!walkable(from.x,from.z)||!walkable(to.x,to.z))return {points:[],visited:0,reason:'invalid'};
 if(dist(from,to)<=radius&&visibleSegment(from,to,walkable))return {points:[],visited:0,reason:'arrived'};
 if(visibleSegment(from,to,walkable))return {points:[{...to}],visited:0,reason:'found'};
 type Node=Point&{g:number;h:number;parent:string|null;key:string};
 const nodes=new Map<string,Node>(),closed=new Set<string>(),open:Node[]=[];
 // Rounded positions can lie inside a wall. Connect the actual position only to
 // reachable neighbours rather than snapping the actor through a corner.
 const sx=Math.round(from.x/GRID),sz=Math.round(from.z/GRID);
 for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){
  const p={x:(sx+dx)*GRID,z:(sz+dz)*GRID};
  if(!visibleSegment(from,p,walkable))continue;
  const k=key(p.x,p.z),n={...p,g:dist(from,p),h:Math.max(0,dist(p,to)-radius),parent:null,key:k};nodes.set(k,n);open.push(n);
 }
 let visited=0;
 const dirs=[[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,-1],[-1,1]] as const;
 while(open.length&&visited<maxNodes){
  open.sort((a,b)=>(a.g+a.h)-(b.g+b.h)||a.h-b.h||a.z-b.z||a.x-b.x);
  const current=open.shift()!;if(closed.has(current.key))continue;closed.add(current.key);visited++;
  if(dist(current,to)<=radius&&visibleSegment(current,to,walkable)){
   const points:Point[]=[];let n:Node|undefined=current;
   while(n){points.push({x:n.x,z:n.z});n=n.parent===null?undefined:nodes.get(n.parent);}
   points.reverse();
   // Collapse only collision-checked straight segments. This is still steering,
   // not a position write; a blocked route never gets a catch-up teleport.
   const smooth:Point[]=[];let anchor=from,index=0;
   while(index<points.length){let far=index;while(far+1<points.length&&visibleSegment(anchor,points[far+1]!,walkable))far++;smooth.push(points[far]!);anchor=points[far]!;index=far+1;}
   return {points:smooth,visited,reason:'found'};
  }
  for(const [dx,dz] of dirs){
   const p={x:current.x+dx*GRID,z:current.z+dz*GRID},k=key(p.x,p.z);
   if(closed.has(k)||!finite(p)||!walkable(p.x,p.z))continue;
   // A diagonal must not cut across the two neighbouring wall cells.
   if(dx&&dz&&(!walkable(current.x+dx*GRID,current.z)||!walkable(current.x,current.z+dz*GRID)))continue;
   if(!visibleSegment(current,p,walkable))continue;
   const g=current.g+dist(current,p),old=nodes.get(k);if(old&&old.g<=g)continue;
   const n={...p,g,h:Math.max(0,dist(p,to)-radius),parent:current.key,key:k};nodes.set(k,n);open.push(n);
  }
 }
 return {points:[],visited,reason:open.length?'budget':'unreachable'};
}
export type FollowPlan={chapter:string;goal:Point;points:Point[];repathAt:number};
export const newFollowPlan=():FollowPlan=>({chapter:'',goal:{x:0,z:0},points:[],repathAt:0});
export function followVector(plan:FollowPlan,from:Point,to:Point,chapter:string,tick:number,walkable:CollisionQuery):Point {
 if(!finite(from)||!finite(to))return {x:0,z:0};
 if(dist(from,to)<=1.7&&visibleSegment(from,to,walkable)){plan.points=[];plan.repathAt=tick;return {x:0,z:0};}
 if(plan.chapter!==chapter||dist(plan.goal,to)>1||tick>=plan.repathAt){
  const result=findRoute(from,to,walkable);
  plan.chapter=chapter;plan.goal={...to};plan.points=result.points;plan.repathAt=tick+30;
 }
 while(plan.points.length&&dist(from,plan.points[0]!)<.15)plan.points.shift();
 const next=plan.points[0];if(!next)return {x:0,z:0};
 // Re-check the imminent move if the collision world changed since planning.
 const length=dist(from,next),v={x:(next.x-from.x)/length,z:(next.z-from.z)/length};
 if(!walkable(from.x+v.x*.09,from.z+v.z*.09)){plan.points=[];return {x:0,z:0};}
 return v;
}
