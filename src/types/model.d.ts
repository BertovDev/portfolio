import { ThreeElement } from "@react-three/fiber";

type PorfolioGLTF = GLTF & {
  nodes: {
    pPlane3_lambert4_0: THREE.Mesh;
    Object_10: THREE.Mesh;
    Object_11: THREE.Mesh;
    Object_12: THREE.Mesh;
    Object_5: THREE.Mesh;
    Object_6: THREE.Mesh;
    Object_7: THREE.Mesh;
    Object_8: THREE.Mesh;
    Object_9: THREE.Mesh;
    Object_159: THREE.Mesh;
    Object_160: THREE.Mesh;
    Object_161: THREE.Mesh;
    Object_157: THREE.Mesh;
    ["Box_1-b_Boxes_0"]: THREE.Mesh;
    Object_46: THREE.Mesh;
    Object_109: THREE.Mesh;
  };
  materials: {
    lambert4: THREE.MeshStandardMaterial;
    VoxMaterial_250: THREE.MeshStandardMaterial;
    VoxMaterial_251: THREE.MeshStandardMaterial;
    VoxMaterial_252: THREE.MeshStandardMaterial;
    VoxMaterial_225: THREE.MeshStandardMaterial;
    VoxMaterial_227: THREE.MeshStandardMaterial;
    VoxMaterial_229: THREE.MeshStandardMaterial;
    VoxMaterial_231: THREE.MeshStandardMaterial;
    VoxMaterial_249: THREE.MeshStandardMaterial;
    label_front: THREE.MeshStandardMaterial;
    label_back: THREE.MeshStandardMaterial;
    label_side: THREE.MeshStandardMaterial;
    vinyl: THREE.MeshStandardMaterial;
    Boxes: THREE.MeshStandardMaterial;
    ["cover.117"]: THREE.MeshStandardMaterial;
    ["cover.138"]: THREE.MeshStandardMaterial;
  };
};

type AboutModelGLTF = GLTF & {
  nodes: {
    tmpsj0p995tply001: THREE.Mesh;
  };
};

type MailGltfResult = GLTF & {
  nodes: {
    ["Letter_02_-_Default_0"]: THREE.Mesh;
    ["Letter_01_-_Default_0"]: THREE.Mesh;
  };
  materials: {
    ["02_-_Default"]: THREE.MeshStandardMaterial;
    ["01_-_Default"]: THREE.MeshStandardMaterial;
  };
};

export default PorfolioGLTF;
export default AboutModelGLTF;
export default MailGltfResult;
