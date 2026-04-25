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
                    icon: 'text-red-600',
                    iconBg: 'bg-red-100',
                    confirmButton: 'bg-red-600 hover:bg-red-700',
                    title: 'text-red-900'
                };
            case 'info':
                return {
                    icon: 'text-blue-600',
                    iconBg: 'bg-blue-100',
                    confirmButton: 'bg-blue-600 hover:bg-blue-700',
                    title: 'text-blue-900'
                };
            default:
                return {
                    icon: 'text-yellow-600',
                    iconBg: 'bg-yellow-100',
                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700',
                    title: 'text-yellow-900'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full ${colors.iconBg} flex items-center justify-center`}>
                                <AlertTriangle className={`w-5 h-5 ${colors.icon}`} />
                            </div>
                            <h3 className={`text-lg font-bold ${colors.title}`}>{title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    
                    <p className="text-slate-600 mb-6 ml-13">{message}</p>
                    
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl transition-colors ${colors.confirmButton}`}
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