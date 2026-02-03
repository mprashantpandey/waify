import { Fragment } from 'react';
import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild} from '@headlessui/react';
import Button from './Button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    loading?: boolean;
}

export default function ConfirmationDialog({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false}: ConfirmationDialogProps) {
    const variantStyles = {
        danger: {
            icon: 'text-red-600 dark:text-red-400',
            button: 'bg-red-600 hover:bg-red-700 text-white'},
        warning: {
            icon: 'text-yellow-600 dark:text-yellow-400',
            button: 'bg-yellow-600 hover:bg-yellow-700 text-white'},
        info: {
            icon: 'text-blue-600 dark:text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 text-white'}};

    const styles = variantStyles[variant];

    return (
        <Transition show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
                                <div className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`flex-shrink-0 ${styles.icon}`}>
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {title}
                                            </DialogTitle>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {message}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                            disabled={loading}
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="mt-6 flex items-center justify-end gap-3">
                                        <Button
                                            variant="secondary"
                                            onClick={onClose}
                                            disabled={loading}
                                        >
                                            {cancelText}
                                        </Button>
                                        <Button
                                            onClick={onConfirm}
                                            disabled={loading}
                                            className={styles.button}
                                        >
                                            {loading ? 'Processing...' : confirmText}
                                        </Button>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

