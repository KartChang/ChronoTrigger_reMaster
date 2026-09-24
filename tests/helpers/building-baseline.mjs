import {landmarkIfDeclared} from './landmark-baseline.mjs';
import {readFileSync} from 'node:fs';
const spec=JSON.parse(readFileSync(new URL('../baselines/vq03a-declared-building-edits.json',import.meta.url),'utf8'));
export function buildingBaseline(name,source){source=landmarkIfDeclared(name,source);const edits=spec.files[name];if(!edits)throw Error('Undeclared building edit');for(const {before,after}of [...edits].reverse()){if(!after||source.split(after).length!==2)throw Error('Building edit missing or duplicated: '+name);source=source.replace(after,before);}return source;}
export const buildingIfDeclared=(name,source)=>{source=landmarkIfDeclared(name,source);return Object.hasOwn(spec.files,name)&&spec.files[name].some(e=>source.includes(e.after))?buildingBaseline(name,source):source;};
