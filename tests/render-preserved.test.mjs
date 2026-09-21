// VQ02C source comparison only: original methods remain checked after explicit actor wiring.
import {actorBaseline} from './helpers/actor-baseline.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const digest=s=>createHash('sha256').update(s).digest('hex');
const fixture=JSON.parse(readFileSync('tests/fixtures/render-preserved-functions.json','utf8'));
const source=actorBaseline(readFileSync('src/render.ts','utf8')),tree=ts.createSourceFile('render.ts',source,ts.ScriptTarget.Latest,true);
const cls=tree.statements.find(n=>ts.isClassDeclaration(n)&&n.name.text==='World');
test('render compatibility does not rewrite original draw, camera, sprite, contact or effects methods',()=>{
 const found={};for(const n of cls.members)if(ts.isMethodDeclaration(n)&&Object.hasOwn(fixture.methods,n.name.getText(tree)))found[n.name.getText(tree)]=digest(n.getText(tree));
 assert.equal(Object.keys(found).length,fixture.count);assert.deepEqual(found,fixture.methods);
});
test('actual scene construction differs only at declared context/scaling bootstrap',()=>{
 let constructor=cls.members.find(n=>ts.isConstructorDeclaration(n)).getText(tree);
 const first=constructor.indexOf('    // Babylon tries WebGL2,'),end=constructor.indexOf('    this.scene=new Scene(this.engine);',first);
 assert(first>0&&end>first);constructor=constructor.slice(0,first)+fixture.engineBootstrap+constructor.slice(end);
 assert.equal(digest(constructor),fixture.constructorHash);
});
test('resize retains the original camera policy after applying only drawing-buffer density',()=>{
 let method=cls.members.find(n=>ts.isMethodDeclaration(n)&&n.name.getText(tree)==='resize').getText(tree);
 const added="    const canvas=this.engine.getRenderingCanvas();\n    if(canvas)this.engine.setHardwareScalingLevel(this.rendering.scale(canvas.clientWidth,canvas.clientHeight,window.devicePixelRatio));\n";
 assert.equal(method.split(added).length,2);method=method.replace(added,'');assert.equal(digest(method),fixture.resizeHash);
});
test('view only appends read-only renderer observations to the retained inspector',()=>{
 const method=cls.members.find(n=>ts.isMethodDeclaration(n)&&n.name.getText(tree)==='inspect').getText(tree);
 assert.equal(method.split('renderer:this.inspectRenderer(),').length,2);assert.equal(digest(method.replace('renderer:this.inspectRenderer(),','')),fixture.inspectHash);
});
