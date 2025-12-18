import React from 'react';
import { useSelection } from '../../context/SelectionContext';
import styles from './SettingsModal.module.css';
import { X, Moon, Sun, Monitor, Type } from 'lucide-react';

export const SettingsModal = ({ onClose }) => {
    const { theme, setTheme, fontSize, setFontSize } = useSelection();

    const themes = [
        { id: 'dark', name: 'Dark', icon: <Moon size={16} /> },
        { id: 'white', name: 'White', icon: <Sun size={16} /> },
        { id: 'purple', name: 'Purple', icon: <Monitor size={16} color="#e040fb" /> },
        { id: 'blue', name: 'Blue', icon: <Monitor size={16} color="#64ffda" /> },
    ];

    const fontSizes = [
        { id: 'small', name: 'Small' },
        { id: 'medium', name: 'Medium' },
        { id: 'large', name: 'Large' },
        { id: 'huge', name: 'Huge' },
    ];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <Type size={18} style={{ marginRight: 8 }} />
                        Editor Settings
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionLabel}>THEME</div>
                    <div className={styles.themeGrid}>
                        {themes.map((t) => (
                            <div
                                key={t.id}
                                className={`${styles.themeCard} ${theme === t.id ? styles.active : ''}`}
                                onClick={() => setTheme(t.id)}
                            >
                                <div className={styles.themeIcon}>{t.icon}</div>
                                <div className={styles.themeName}>{t.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionLabel}>FONT SIZE</div>
                    <div className={styles.fontGrid}>
                        {fontSizes.map((f) => (
                            <button
                                key={f.id}
                                className={`${styles.fontBtn} ${fontSize === f.id ? styles.active : ''}`}
                                onClick={() => setFontSize(f.id)}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.saveBtn} onClick={onClose}>Apply Changes</button>
                </div>
            </div>
        </div>
    );
};
