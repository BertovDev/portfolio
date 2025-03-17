import { create } from "zustand";

type CameraState = {
  cameraZoomed: boolean;
  isTransitioning: boolean;
  setCameraZoomed: (camera: boolean) => void;
  setTransitioning: (camera: boolean) => void;
};

type SectionState = {
  isSectionClicked: boolean;
  setSectionClicked: (section: boolean) => void;
};

const useCameraStore = create<CameraState>((set) => ({
  cameraZoomed: false,
  isTransitioning: false,
  setCameraZoomed: (isZoomed: boolean) => set({ cameraZoomed: isZoomed }),
  setTransitioning: (state: boolean) => set({ isTransitioning: state }),
}));

const useSectionStore = create<SectionState>((set) => ({
  isSectionClicked: false,
  setSectionClicked: (state: boolean) => set({ isSectionClicked: state }),
}));

export { useCameraStore, useSectionStore };
