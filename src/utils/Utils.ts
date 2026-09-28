import { create } from "zustand";

type CameraState = {
  cameraZoomed: boolean;
  isTransitioning: boolean;
  setCameraZoomed: (camera: boolean) => void;
  setTransitioning: (camera: boolean) => void;
};

type SectionParms = {
  isClicked: boolean;
  name: string | null;
};

type SectionState = {
  isSectionClicked: SectionParms;
  setSectionClicked: (name: string | null, state: boolean) => void;
};

type ClearDiplomasState = {
  isClearDiplomas: boolean;
  // Latches on the first diploma request; keeps the lazily loaded physics
  // world mounted afterwards (as it was before physics became lazy).
  physicsRequested: boolean;
  setClearDiplomas: (state: boolean) => void;
  disolveDiplomas: boolean;
  setDisolveDiplomas: (state: boolean) => void;
};

type LoadingState = {
  /** Mirror of drei's `useProgress().progress` (0-100), fed from the Scene chunk. */
  progress: number;
  /** Latches once the main scene's shaders are compiled and its first frame rendered. */
  sceneReady: boolean;
  setProgress: (progress: number) => void;
  setSceneReady: (ready: boolean) => void;
};

const useCameraStore = create<CameraState>((set) => ({
  cameraZoomed: false,
  isTransitioning: false,
  setCameraZoomed: (isZoomed: boolean) => set({ cameraZoomed: isZoomed }),
  setTransitioning: (state: boolean) => set({ isTransitioning: state }),
}));

const useSectionStore = create<SectionState>((set) => ({
  isSectionClicked: { isClicked: false, name: null },
  setSectionClicked: (name: string | null, state: boolean) =>
    set({ isSectionClicked: { name: name, isClicked: state } }),
}));

const useClearDiplomasStore = create<ClearDiplomasState>((set) => ({
  isClearDiplomas: false,
  physicsRequested: false,
  setClearDiplomas: (state: boolean) =>
    set(
      state
        ? { isClearDiplomas: true, physicsRequested: true }
        : { isClearDiplomas: false }
    ),
  disolveDiplomas: false,
  setDisolveDiplomas: (state: boolean) => set({ disolveDiplomas: state }),
}));

// Lives in the initial bundle so the loading UI can read progress without
// importing drei/three; the Scene chunk writes to it (see Scene.tsx).
const useLoadingStore = create<LoadingState>((set) => ({
  progress: 0,
  sceneReady: false,
  setProgress: (progress: number) => set({ progress }),
  setSceneReady: (ready: boolean) => set({ sceneReady: ready }),
}));

export {
  useCameraStore,
  useSectionStore,
  useClearDiplomasStore,
  useLoadingStore,
};
