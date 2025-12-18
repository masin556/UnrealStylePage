import React, { useState, useEffect, useRef } from 'react';
import styles from './InputModal.module.css';
import { X } from 'lucide-react';

export const InputModal = ({ isOpen, onClose, onSubmit, title, placeholder, initialValue = '' }) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(value);
        onClose();
    };

    return (
        <div className={styles.overlay} onMouseDown={onClose}>
            <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <span>{title}</span>
                    <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={onClose} />
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <div>
                            <div className={styles.label}>Name</div>
                            <input
                                ref={inputRef}
                                className={styles.input}
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                placeholder={placeholder}
                                spellCheck={false}
                            />
                        </div>
                    </div>
                    <div className={styles.footer}>
                        <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
