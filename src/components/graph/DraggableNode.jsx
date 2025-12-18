import React, { useState } from 'react';
import styles from './Graph.module.css';
import { Play, X, Info, Target } from 'lucide-react';
import { useSelection } from '../../context/SelectionContext';

export const DraggableNode = ({ data, isSelected, onClick, onPinMouseDown, onPinMouseUp, onDelete, isWiring, onResizeMouseDown }) => {
    const { isAdmin, updateNode, projects, openProject } = useSelection();
    const [isEditing, setIsEditing] = useState(false);

    // Determine color based on category/type
    const getHeaderColor = () => {
        if (data.type === 'comment') return '#333'; // Comment Gray
        if (data.type === 'event' || data.category === 'event' || data.type === 'tick') return '#b61d1d'; // Event Red
        if (data.type === 'variable' || data.category === 'variable') {
            return data.type === 'variable_set' ? '#4a8e2d' : '#2d6a8e'; // Var colors
        }
        if (data.type === 'project') return '#ff9600'; // Project Orange
        if (data.type === 'sequence') return '#1a1a1a'; // Sequence Dark
        return '#1b4d81'; // Function Blue
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        if (data.type === 'project') {
            openProject(data.projectId);
            return;
        }
        if (!isAdmin) return;
        setIsEditing(true);
    };

    const handleBlur = (e) => {
        const node = e.currentTarget.closest(`.${styles.node}`);
        setTimeout(() => {
            if (node && node.contains(document.activeElement)) {
                return;
            }
            setIsEditing(false);
        }, 150);
    };

    const handleTitleChange = (e) => updateNode(data.id, { title: e.target.value });
    const handleDescChange = (e) => updateNode(data.id, { description: e.target.value });

    const stopPropagation = (e) => e.stopPropagation();

    const isVariable = data.category === 'variable' || data.type === 'variable' || data.type === 'variable_set';
    const isSet = data.type === 'variable_set';
    const isComment = data.type === 'comment';
    const isSequence = data.type === 'sequence';

    const handleAddSequencePin = (e) => {
        e.stopPropagation();
        if (!isAdmin) return;
        updateNode(data.id, { sequencePins: (data.sequencePins || 2) + 1 });
    };

    const nodeClasses = [
        styles.node,
        isSelected && styles.selected,
        isVariable && !isSet && styles.varGet,
        isSet && styles.varSet,
        isComment && styles.commentNode,
        isSequence && styles.sequenceNode,
        data.type === 'project' && styles.projectNode
    ].filter(Boolean).join(' ');

    const handleNodeClick = (e) => {
        if (!isAdmin && data.type === 'project') {
            openProject(data.projectId);
        }
        onClick(e);
    };

    return (
        <div
            className={nodeClasses}
            onMouseDown={handleNodeClick}
            onDoubleClick={handleDoubleClick}
            style={{ width: data.width, height: data.height }}
        >
            <div className={styles.nodeHeader} style={{ backgroundColor: getHeaderColor() }}>
                <div className={styles.headerLeft}>
                    {(data.type === 'tick' || data.type === 'event' || data.category === 'event') && <div className={styles.tickDiamond} />}
                    {data.category === 'function' && <div className={styles.funcDiamond} />}
                    {data.type === 'project' && <div className={styles.iconEvent} style={{ backgroundColor: '#ff9600', transform: 'none', borderRadius: 2 }} >P</div>}
                    {isEditing ? (
                        <input
                            autoFocus
                            className={styles.editInput}
                            value={data.title}
                            onChange={handleTitleChange}
                            onBlur={handleBlur}
                            onMouseDown={stopPropagation}
                        />
                    ) : (
                        <span className={styles.nodeTitle}>{data.title}</span>
                    )}
                </div>
                {(data.type === 'tick' || data.type === 'event' || data.category === 'event') && <div className={styles.tickBox} />}
                {isAdmin && (
                    <button className={styles.deleteNodeBtn} onMouseDown={stopPropagation} onClick={onDelete}>
                        <X size={12} />
                    </button>
                )}
            </div>

            <div className={styles.nodeBody}>
                {/* Pins Section - Hide for comments */}
                {!isComment && (
                    <div className={styles.pinSection}>
                        {/* INPUTS */}
                        <div className={styles.inputs}>
                            {/* Show Exec for non-variables OR SET variables (GET variables still hide it) */}
                            {(data.type !== 'event' && data.category !== 'event' && (!isVariable || isSet)) && (
                                <div className={styles.pinWrapper}
                                    onMouseDown={(e) => onPinMouseDown(e, data.id, 'in_exec', 'in')}
                                    onMouseUp={(e) => onPinMouseUp(e, data.id, 'in_exec', 'in')}
                                >
                                    <Play size={10} fill="white" className={styles.execPin} />
                                    <span className={styles.pinLabel}>Exec</span>
                                </div>
                            )}
                            {(isSet || (isVariable && data.hasTarget) || data.category === 'function') && (
                                <div className={styles.pinWrapper}
                                    onMouseDown={(e) => onPinMouseDown(e, data.id, 'in_data', 'in')}
                                    onMouseUp={(e) => onPinMouseUp(e, data.id, 'in_data', 'in')}
                                >
                                    <div className={styles.dataPin} style={{ backgroundColor: '#29c3ff' }} />
                                    <span className={styles.pinLabel}>{isSet ? 'Value' : 'Target'}</span>
                                    {(!isSet && data.category === 'function') && <div className={styles.selfBox}>self</div>}
                                </div>
                            )}
                        </div>

                        {/* OUTPUTS */}
                        <div className={styles.outputs}>
                            {/* Variables don't have exec output in typical UE get/set nodes, but SET usually does. */}
                            {(data.type === 'event' || data.type === 'tick' || data.type === 'beginplay' || data.category === 'function' || isSet) && (
                                <div className={`${styles.pinWrapper} ${styles.right}`}
                                    onMouseDown={(e) => onPinMouseDown(e, data.id, 'out_exec', 'out')}
                                    onMouseUp={(e) => onPinMouseUp(e, data.id, 'out_exec', 'out')}
                                >
                                    <span className={styles.pinLabel}>Then</span>
                                    <Play size={10} fill="white" className={styles.execPin} />
                                </div>
                            )}
                            {data.type === 'tick' && (
                                <div className={`${styles.pinWrapper} ${styles.right}`}
                                    onMouseDown={(e) => onPinMouseDown(e, data.id, 'out_delta', 'out')}
                                    onMouseUp={(e) => onPinMouseUp(e, data.id, 'out_delta', 'out')}
                                >
                                    <span className={styles.pinLabel}>Delta Seconds</span>
                                    <div className={styles.dataPin} style={{ backgroundColor: '#4caf50', border: '1px solid #1a5a1a' }} />
                                </div>
                            )}
                            {data.category !== 'event' && data.type !== 'tick' && data.type !== 'beginplay' && !isSequence && (
                                <div className={`${styles.pinWrapper} ${styles.right}`}
                                    onMouseDown={(e) => onPinMouseDown(e, data.id, 'out_data', 'out')}
                                    onMouseUp={(e) => onPinMouseUp(e, data.id, 'out_data', 'out')}
                                >
                                    <span className={styles.pinLabel}>{isVariable ? '' : 'Return'}</span>
                                    <div className={styles.dataPin} style={{ backgroundColor: isVariable ? '#4a8e2d' : '#ff9600' }} />
                                </div>
                            )}

                            {/* Sequence Node: Multiple Then outputs */}
                            {isSequence && (
                                <>
                                    {Array.from({ length: data.sequencePins || 2 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`${styles.pinWrapper} ${styles.right}`}
                                            onMouseDown={(e) => onPinMouseDown(e, data.id, `out_then_${i}`, 'out')}
                                            onMouseUp={(e) => onPinMouseUp(e, data.id, `out_then_${i}`, 'out')}
                                        >
                                            <span className={styles.pinLabel}>Then {i}</span>
                                            <Play size={10} fill="white" className={styles.execPin} />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.nodeContent}>
                    {isEditing ? (
                        <textarea
                            className={styles.editTextarea}
                            value={data.description}
                            onChange={handleDescChange}
                            onBlur={handleBlur}
                            onMouseDown={stopPropagation}
                            placeholder={isComment ? "Enter comment text..." : "Double click to edit details"}
                        />
                    ) : (
                        <>
                            {data.type === 'project' && (() => {
                                const liveProject = projects.find(p => p.id === data.projectId);
                                const displayImage = (liveProject ? liveProject.image : data.image) || '/Images/ActorImage.png';
                                return (
                                    <div className={styles.projectPreview} onClick={() => openProject(data.projectId)}>
                                        <img
                                            src={displayImage}
                                            alt={data.title}
                                            className={styles.projectThumb}
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/Images/ActorImage.png'; }}
                                        />
                                        <div className={styles.projectInfo}>
                                            <div className={styles.projectTitle}>{liveProject ? liveProject.title : data.title}</div>
                                            <div className={styles.projectShortDesc}>{liveProject ? liveProject.description : data.description}</div>
                                            <div className={styles.projectClickHint}>Click to open full details</div>
                                        </div>
                                    </div>
                                );
                            })()}
                            {!(data.type === 'tick' || data.type === 'beginplay' || data.type === 'project') && (
                                <>
                                    {!isComment && (
                                        <div className={styles.nodeSubtitle} style={{ fontStyle: 'italic', opacity: 0.7 }}>
                                            {data.category === 'function' ? `Target is ${data.targetClass || 'Profile'}` : data.subtitle}
                                        </div>
                                    )}
                                    <div className={styles.nodeDesc}>{data.description}</div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Add Pin Button for Sequence Node */}
                {isSequence && isAdmin && (
                    <div className={styles.addPinBtn} onClick={handleAddSequencePin} onMouseDown={stopPropagation}>
                        <span>Add pin</span>
                        <span style={{ fontSize: '14px', marginLeft: '6px' }}>⊕</span>
                    </div>
                )}

                {isComment && (
                    <div
                        className={styles.resizeHandle}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizeMouseDown(e, data.id);
                        }}
                    />
                )}
            </div>
        </div>
    );
};
