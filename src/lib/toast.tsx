'use client';

import React from 'react';
import { toast } from "sonner";

export const toastSuccess = (message: string) => {
    toast.success(message);
};

export const toastError = (message: string) => {
    toast.error(message);
};

export const toastInfo = (message: string) => {
    toast(message);
};

export const toastConfirm = (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
) => {
    toast.custom((t) => (
        <div className="flex flex-col gap-2 bg-white p-4 rounded shadow-lg">
            <p>{message}</p>
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        onConfirm();
                        toast.dismiss(t);
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                    Confirmar
                </button>
                <button
                    onClick={() => {
                        onCancel?.();
                        toast.dismiss(t);
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
                >
                    Cancelar
                </button>
            </div>
        </div>
    ));
};
