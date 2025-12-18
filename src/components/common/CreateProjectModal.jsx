import React, { useState } from 'react';
import styles from './CreateProjectModal.module.css';
import { X, Box, FileText, Globe, Cpu } from 'lucide-react';
import { useSelection } from '../../context/SelectionContext';
import { useToast } from '../../context/ToastContext';

const PRESETS = [
    { id: 'BP_FPS', name: 'First Person Shooter', icon: <Cpu size={16} /> },
    { id: 'BP_RPG', name: 'Role Playing Game', icon: <Globe size={16} /> },
    { id: 'BP_Strategy', name: 'Strategy / RTS', icon: <Box size={16} /> },
    { id: 'BP_Other', name: 'Empty / Other', icon: <FileText size={16} /> },
];

export const CreateProjectModal = ({ isOpen, onClose }) => {
    const { addProject } = useSelection();
    const { addToast } = useToast();
    const [selectedType, setSelectedType] = useState('BP_FPS');

    const [formData, setFormData] = useState({
        title: '',
        date: new Date().getFullYear() + '.' + String(new Date().getMonth() + 1).padStart(2, '0'),
        description: '',
        tags: 'MAIN',
        link: '#'
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.title) return;

        const newProject = addProject({
            title: formData.title,
            category: selectedType,
            date: formData.date,
            description: formData.description || "No description provided.",
            details: `# ${formData.title}\nDetails pending...`,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            link: formData.link
        });

        addToast(`Project '${formData.title}' created successfully.`, 'success');
        onClose();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <span>Create New Project Asset</span>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.body}>
                    {/* Left: Type Selection */}
                    <div className={styles.leftPanel}>
                        <div className={styles.panelTitle}>Project Class</div>
                        {PRESETS.map(preset => (
                            <button
                                key={preset.id}
                                className={`${styles.typeBtn} ${selectedType === preset.id ? styles.active : ''}`}
                                onClick={() => setSelectedType(preset.id)}
                            >
                                <div className={styles.typeIcon}>{preset.icon}</div>
                                {preset.name}
                            </button>
                        ))}
                        <div className={styles.helperText} style={{ marginTop: 'auto', padding: 8 }}>
                            Parent Class: <br />
                            <span style={{ color: '#4caf50' }}>Project Asset (Blueprint)</span>
                        </div>
                    </div>

                    {/* Right: Details Form */}
                    <div className={styles.rightPanel}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input
                                className={styles.input}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="P_MyProject"
                                autoFocus
                            />
                            <div className={styles.helperText}>The unique name of the project asset.</div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date</label>
                            <input
                                className={styles.input}
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description</label>
                            <textarea
                                className={styles.textarea}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short summary of the project..."
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Tags (comma separated)</label>
                            <input
                                className={styles.input}
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="MAIN, SIDE, PROTOTYPE"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>External Link</label>
                            <input
                                className={styles.input}
                                value={formData.link} // Changed from formData.tags to formData.link
                                onChange={e => setFormData({ ...formData, link: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={onClose}>Cancel</button>
                    <button
                        className={`${styles.btn} ${styles.createBtn}`}
                        onClick={handleSubmit}
                        disabled={!formData.title}
                    >
                        Create Asset
                    </button>
                </div>
            </div>
        </div>
    );
};
