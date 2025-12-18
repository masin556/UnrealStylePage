import React from 'react';
import styles from './ConfirmationModal.module.css';
import { AlertTriangle } from 'lucide-react';

export const ConfirmationModal = ({
    isOpen,
    title = "Confirmation",
    message = "Are you sure you want to proceed?",
    onConfirm,
    onCancel,
    isDanger = false
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.card} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <AlertTriangle size={16} />
                    {title}
                </div>
                <div className={styles.body}>
                    {message}
                </div>
                <div className={styles.footer}>
                    <button className={styles.btn + ' ' + styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.btn} ${styles.confirmBtn} ${isDanger ? styles.danger : ''}`}
                        onClick={onConfirm}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
