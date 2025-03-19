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

export { useCameraStore, useSectionStore };
