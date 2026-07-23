// Augment the React JSX module with Three.js element types.
// R3F's built-in JSX augmentation doesn't work with this build setup.
// This imports react to make this a module, then augments the JSX namespace.

import "react";

type El = { [key: string]: any; children?: React.ReactNode };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      // Object types
      group: El; mesh: El; points: El; line: El; lineSegments: El; lineLoop: El;
      sprite: El; instancedMesh: El; skinnedMesh: El; bone: El;
      // Geometries
      bufferGeometry: El; sphereGeometry: El; boxGeometry: El; cylinderGeometry: El;
      coneGeometry: El; planeGeometry: El; ringGeometry: El; torusGeometry: El;
      circleGeometry: El; tubeGeometry: El; tetrahedronGeometry: El;
      octahedronGeometry: El; dodecahedronGeometry: El; icosahedronGeometry: El;
      shapeGeometry: El; latheGeometry: El; extrudeGeometry: El;
      // Materials
      meshStandardMaterial: El; meshBasicMaterial: El; meshPhongMaterial: El;
      meshLambertMaterial: El; meshMatcapMaterial: El; meshNormalMaterial: El;
      meshDepthMaterial: El; meshToonMaterial: El; meshPhysicalMaterial: El;
      pointsMaterial: El; lineBasicMaterial: El; lineDashedMaterial: El;
      spriteMaterial: El; shadowMaterial: El;
      // Attributes
      bufferAttribute: El; instancedBufferAttribute: El;
      // Lights
      ambientLight: El; directionalLight: El; pointLight: El; spotLight: El;
      hemisphereLight: El; rectAreaLight: El;
      // Helpers / Misc
      axesHelper: El; gridHelper: El; boxHelper: El; cameraHelper: El;
      // R3F-specific
      primitive: El;
      // Textures
      canvasTexture: El; texture: El; videoTexture: El;
      // Fog
      fog: El; fogExp2: El;
    }
  }
}