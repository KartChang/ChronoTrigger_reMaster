import {Color3,Material,Scene,StandardMaterial} from '@babylonjs/core';
/** StandardMaterial otherwise multiplies emissive texture by diffuse texture.
 * For unlit pixel actors use emissive-as-illumination exactly once, preserving
 * the authored palette instead of squaring RGB or adding the old gray emission.
 */
export function preservePixelPalette(material:StandardMaterial):void{
 material.useEmissiveAsIllumination=true;material.linkEmissiveWithDiffuse=false;
 material.emissiveColor=Color3.Black();material.specularColor=Color3.Black();
 material.ambientColor=Color3.Black();
}
export class PixelPalettePass{
 private known=new WeakSet<StandardMaterial>();
 count=0;
 apply(scene:Scene):void{
  for(const material of scene.materials){
   if(!(material instanceof StandardMaterial)||!material.disableLighting||material.transparencyMode!==Material.MATERIAL_ALPHATEST||!material.diffuseTexture||material.emissiveTexture!==material.diffuseTexture)continue;
   // A material can be reused by multiple scenes; verify live settings, not only first sight.
   if(!material.useEmissiveAsIllumination||material.linkEmissiveWithDiffuse||!material.emissiveColor.equalsFloats(0,0,0)||!material.specularColor.equalsFloats(0,0,0)||!material.ambientColor.equalsFloats(0,0,0))preservePixelPalette(material);
   if(!this.known.has(material)){this.known.add(material);this.count++;}
  }
 }
}
