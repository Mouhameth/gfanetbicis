"use client";
import React from "react";
import { IoIosAddCircle } from "react-icons/io";

type AddButtonProps = {
    label: string;
    onClick: () => void;
    /** Icône optionnelle (défaut : cercle +). */
    icon?: React.ReactNode;
    disabled?: boolean;
};

// Bouton d'action principal « Ajouter / Nouveau » — style CGF unifié sur tout le backoffice.
export function AddButton({ label, onClick, icon, disabled }: AddButtonProps) {
    return (
        <button
            type="button"
            data-tour="add"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
        >
            {icon ?? <IoIosAddCircle size={16} />}
            {label}
        </button>
    );
}

export default AddButton;
