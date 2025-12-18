import React from 'react';
import { useSelection } from '../../context/SelectionContext';
import styles from './TabBrowser.module.css';
import { X, FileCode } from 'lucide-react';
import { Reorder } from 'framer-motion';

export const TabBrowser = () => {
    const { tabs, activeTabId, setActiveTabId, closeTab, reorderTabs } = useSelection();

    if (tabs.length === 0) return null;

    return (
        <Reorder.Group
            axis="x"
            values={tabs}
            onReorder={reorderTabs}
            className={styles.tabContainer}
        >
            {tabs.map((tab) => (
                <Reorder.Item
                    key={tab.id}
                    value={tab}
                    className={`${styles.tab} ${activeTabId === tab.id ? styles.active : ''}`}
                    onClick={() => setActiveTabId(tab.id)}
                    style={{ cursor: 'grab' }}
                >
                    <FileCode size={14} className={styles.tabIcon} />
                    <span className={styles.tabTitle}>P_{tab.title}</span>
                    <button
                        className={styles.closeBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                        }}
                    >
                        <X size={12} />
                    </button>
                </Reorder.Item>
            ))}
        </Reorder.Group>
    );
};
