// ConfirmationModal.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning' // warning, danger, info
}) => {
    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-500',
                    iconBg: 'bg-red-500/10',
                    iconBorder: 'border-red-500/20',
                    confirmButton: 'bg-red-600 hover:bg-red-700 border-red-500/20',
                    title: 'text-red-400'
                };
            case 'info':
                return {
                    icon: 'text-blue-500',
                    iconBg: 'bg-blue-500/10',
                    iconBorder: 'border-blue-500/20',
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 border-blue-500/20',
                    title: 'text-blue-400'
                };
            default:
                return {
                    icon: 'text-amber-500',
                    iconBg: 'bg-amber-500/10',
                    iconBorder: 'border-amber-500/20',
                    confirmButton: 'bg-amber-600 hover:bg-amber-700 border-amber-500/20',
                    title: 'text-amber-400'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-md transform transition-all border border-border glass">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full ${colors.iconBg} border ${colors.iconBorder} flex items-center justify-center`}>
                                <AlertTriangle className={`w-5 h-5 ${colors.icon}`} />
                            </div>
                            <h3 className={`text-lg font-bold font-space ${colors.title}`}>{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 ml-13">{message}</p>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-white/10 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-colors shadow-lg border ${colors.confirmButton}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;