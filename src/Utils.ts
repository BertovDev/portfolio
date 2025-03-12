import { create } from "zustand";

type CameraState = {
  cameraZoomed: boolean;
  setCameraZoomed: (camera: boolean) => void;
};

const useCameraStore = create<CameraState>((set) => ({
  cameraZoomed: false,
  setCameraZoomed: (isZoomed: boolean) => set({ cameraZoomed: isZoomed }),
}));

export default useCameraStore;
