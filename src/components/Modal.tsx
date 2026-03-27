'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    footer?: ReactNode;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    footer,
}: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative bg-white rounded-lg shadow-lg ${sizeClasses[size]} w-full mx-4 max-h-[90vh] overflow-y-auto`}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                        {description && (
                            <p className="text-sm text-gray-600 mt-1">{description}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="border-t border-gray-200 p-6 flex gap-3 justify-end">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
