import React from 'react';
import { useSelection } from '../../context/SelectionContext';
import styles from './DetailsPanel.module.css';
import { MousePointer2 } from 'lucide-react';

export const DetailsPanel = () => {
    const { selection, nodes } = useSelection();

    if (!selection) {
        return (
            <div className={styles.emptyState}>
                <MousePointer2 size={48} color="#555" />
                <p>Select a Node or Project to view details.</p>
            </div>
        );
    }

    const { data, type } = selection;

    // Use live data if available (for real-time updates)
    const liveData = type === 'node' ? nodes.find(n => n.id === data.id) || data : data;

    return (
        <div className={styles.container}>
            <div className={styles.header}>Details</div>
            <div className={styles.content}>
                <h2 className={styles.title}>{liveData.title || liveData.name}</h2>
                <div className={styles.typeBadge}>{type.toUpperCase()}</div>

                <div className={styles.properties}>
                    {liveData.details && (
                        <div className={styles.propGroup}>
                            <label>Description</label>
                            <p>{liveData.description}</p>
                        </div>
                    )}

                    {/* Fallback for non-detailed nodes, show description/subtitle */}
                    {!liveData.details && liveData.description && (
                        <div className={styles.propGroup}>
                            <label>Description</label>
                            <p>{liveData.description}</p>
                        </div>
                    )}

                    {liveData.details && (
                        <div className={styles.propGroup}>
                            <label>Technical Details</label>
                            <div className={styles.codeBlock}>
                                {liveData.details.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                            </div>
                        </div>
                    )}

                    {liveData.link && (
                        <div className={styles.propGroup}>
                            <a href={liveData.link} target="_blank" rel="noreferrer" className={styles.actionBtn}>
                                View Project
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
