import type {Chapter} from './fair-data';
const DB='chrono-hd2d-prototype';
const key=(chapter:Chapter)=>chapter==='lab'?'slot1':'fair-slot1';
function open():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{
  const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('saves');
  r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error??new Error('無法開啟本機存檔。'));r.onblocked=()=>reject(new Error('請關閉其他遊戲分頁後再試。'));
});}
export async function save(raw:string,chapter:Chapter='lab'):Promise<void>{const db=await open();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('saves','readwrite');tx.objectStore('saves').put(raw,key(chapter));tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error('存檔交易已中止。'));});}finally{db.close();}}
export async function load(chapter:Chapter='lab'):Promise<string|null>{const db=await open();try{return await new Promise<string|null>((resolve,reject)=>{const tx=db.transaction('saves');const r=tx.objectStore('saves').get(key(chapter));let value:string|null=null;r.onsuccess=()=>{value=typeof r.result==='string'?r.result:null;};tx.oncomplete=()=>resolve(value);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}finally{db.close();}}
