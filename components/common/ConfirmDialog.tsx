"use client";
import { Modal } from "@mui/material";
import React from "react";

type Variant = "primary" | "success" | "destructive";

type ConfirmDialogProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: Variant;
};

const variantClass: Record<Variant, string> = {
    primary: "bg-primary hover:bg-primary/90",
    success: "bg-success hover:bg-success/90",
    destructive: "bg-destructive hover:bg-destructive/90",
};

// Modale de confirmation générique (activer / désactiver / supprimer…).
export function ConfirmDialog({
    open,
    onClose,
    title,
    message,
    onConfirm,
    confirmLabel = "Oui",
    cancelLabel = "Non",
    variant = "primary",
}: ConfirmDialogProps) {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="w-[92%] max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 mx-auto mt-[12vh] outline-none">
                <p className="text-sm font-semibold py-2 text-foreground">{title}</p>
                <p className="text-xs font-semibold text-center text-muted-foreground">{message}</p>
                <div className="py-4 flex items-center justify-center gap-3">
                    <button
                        onClick={onConfirm}
                        className={`text-white text-sm font-semibold py-2 px-3 rounded-md transition-colors ${variantClass[variant]}`}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-muted text-foreground text-sm font-semibold py-2 px-3 rounded-md hover:bg-muted/80 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmDialog;
