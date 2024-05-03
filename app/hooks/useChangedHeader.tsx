import { create } from "zustand";

interface ModalStore {
    title: string;
    onChanged: (title: string) => void;
}

const useChangeHeaderTitle = create<ModalStore>((set) => ({
    title: "",
    onChanged: (title: string) => set({ title: title }),
}));

export default useChangeHeaderTitle;