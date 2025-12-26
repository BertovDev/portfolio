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
  setClearDiplomas: (state: boolean) => void;
  disolveDiplomas: boolean;
  setDisolveDiplomas: (state: boolean) => void;
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
  setClearDiplomas: (state: boolean) => set({ isClearDiplomas: state }),
  disolveDiplomas: false,
  setDisolveDiplomas: (state: boolean) => set({ disolveDiplomas: state }),
}));

export { useCameraStore, useSectionStore, useClearDiplomasStore };
