import { create } from 'zustand';

export type UIModalId =
  | 'session_e1'
  | 'score_e2'
  | 'coherence_e3'
  | 'gardener_e4'
  | 'hrtf_e5'
  | 'gallery_e6'
  | 'community_e7'
  | 'future_e8'
  | 'calibrator'
  | 'mapping'
  | 'tutor'
  | 'exam'
  | 'curriculum'
  | 'samples';

interface UIPanelState {
  activeModal: UIModalId | null;
  openModal: (id: UIModalId) => void;
  closeModal: () => void;
  toggleModal: (id: UIModalId) => void;
}

export const useUIPanelStore = create<UIPanelState>((set) => ({
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  toggleModal: (id) =>
    set((state) => ({ activeModal: state.activeModal === id ? null : id })),
}));
