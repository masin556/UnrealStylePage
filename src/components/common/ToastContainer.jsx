import React from 'react';
import { useToast } from '../../context/ToastContext';
import styles from './ToastContainer.module.css';
import { X } from 'lucide-react';

export const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className={styles.container}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${styles.toast} ${styles[toast.type] || ''}`}
                >
                    <span className={styles.message}>{toast.message}</span>
                    <button className={styles.closeBtn} onClick={() => removeToast(toast.id)}>
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
};
