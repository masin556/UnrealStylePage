import React, { useState } from 'react';
import styles from './CreateProjectModal.module.css'; // Reusing existing modal styles for consistency
import { X, Check } from 'lucide-react';

export const CreateSkillModal = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('Boolean');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(name, type);
        setName('');
        setType('Boolean');
        onClose();
    };

    const types = [
        { label: 'Boolean', value: 'Boolean', color: '#8d0202' },
        { label: 'Integer', value: 'Integer', color: '#29c3ff' },
        { label: 'Integer64', value: 'Integer64', color: '#96ef96' },
        { label: 'Float', value: 'Float', color: '#3ecf3e' },
        { label: 'String', value: 'String', color: '#ff00ff' },
        { label: 'Vector', value: 'Vector', color: '#ffd700' },
        { label: 'Rotator', value: 'Rotator', color: '#9999ff' },
        { label: 'Transform', value: 'Transform', color: '#ff6600' },
        { label: 'Object', value: 'Object', color: '#00ccff' }
    ];

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} style={{ width: '400px', height: 'auto' }}>
                <div className={styles.header}>
                    <span className={styles.title}>Add New Variable (Skill)</span>
                    <button className={styles.closeBtn} onClick={onClose}><X size={14} /></button>
                </div>
                <div className={styles.body}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className={styles.label}>Name</label>
                            <input
                                className={styles.input}
                                autoFocus
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g. C++, Networking, Level Design"
                                required
                            />
                        </div>
                        <div>
                            <label className={styles.label}>Variable Type</label>
                            <select
                                className={styles.input}
                                value={type}
                                onChange={e => setType(e.target.value)}
                                style={{ backgroundColor: '#111', color: 'white' }}
                            >
                                {types.map(t => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                    <button className={styles.createBtn} onClick={handleSubmit}>
                        <Check size={14} style={{ marginRight: 4 }} />
                        Add Variable
                    </button>
                </div>
            </div>
        </div>
    );
};
