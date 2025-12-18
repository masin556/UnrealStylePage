import React, { useRef, useState, useEffect } from 'react';
import { careerNodes } from '../../data/career';
import { DraggableNode } from './DraggableNode';
import { GraphConnection } from './GraphConnection';
import { useSelection } from '../../context/SelectionContext';
import { ADMIN_CONFIG } from '../../config/admin';
import styles from './Graph.module.css';

import { ProjectWindow } from './ProjectWindow';
import { ProjectEditor } from '../panels/ProjectEditor';

export const GraphEditor = () => {
    const { selection, selectNode, clearSelection, tabs, activeTabId, isAdmin, isEditing, setIsEditing, saveProjectFile, nodes, updateNodes, setNodesLocal, connections, updateConnections, isSimulating, setIsSimulating } = useSelection();

    const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
    // Refs for Global Event Listeners (avoids stale closures without re-binding listeners)
    const viewRef = useRef(view);
    const nodesRef = useRef(nodes);

    useEffect(() => { viewRef.current = view; }, [view]);
    useEffect(() => { nodesRef.current = nodes; }, [nodes]);

    // Wiring State
    const [wireStart, setWireStart] = useState(null); // { nodeId, pinId, type, startX, startY }
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const activeProject = tabs.find(t => t.id === activeTabId);
    const [isPanning, setIsPanning] = useState(false);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const [resizingNodeId, setResizingNodeId] = useState(null);
    const [isCompiled, setIsCompiled] = useState(true);
    const [needsCompile, setNeedsCompile] = useState(false);
    const containerRef = useRef(null);

    // Node Spawning
    const spawnNode = (type, category) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate center of view in "world" space
        const worldX = (rect.width / 2 - view.x) - 140; // Subtract half node width
        const worldY = (rect.height / 2 - view.y) - 50;

        const id = `node_${Date.now()}`;
        const newNode = {
            id,
            type,
            title: type === 'tick' ? "Event Tick"
                : type === 'beginplay' ? "Event BeginPlay"
                    : type === 'comment' ? "Comment"
                        : type === 'project' ? "Project Asset"
                            : type === 'sequence' ? "Sequence"
                                : category === 'event' ? "New Event"
                                    : category === 'function' ? "New Function" : "New Variable",
            subtitle: type === 'tick' ? "Continuous Logic" : type === 'beginplay' ? "Entry Point" : type === 'sequence' ? "Utility" : category,
            description: type === 'tick' ? "Executed every frame."
                : type === 'beginplay' ? "Executed when game starts."
                    : type === 'comment' ? "Explain your logic here..."
                        : type === 'sequence' ? "Executes outputs in order"
                            : "Double click to edit details",
            x: worldX,
            y: worldY,
            width: type === 'comment' ? 400 : undefined,
            height: type === 'comment' ? 300 : undefined,
            category: type === 'comment' ? 'other' : type === 'sequence' ? 'utility' : category,
            sequencePins: type === 'sequence' ? 2 : undefined
        };
        updateNodes([...nodes, newNode]);
    };

    // Wiring Handlers
    const handlePinMouseDown = (e, nodeId, pinId, type) => {
        if (!isAdmin) return;
        e.stopPropagation();

        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        setWireStart({
            nodeId,
            pinId,
            type,
            isData: pinId.includes('data') || pinId.includes('delta'),
            startX: (rect.left - containerRect.left + rect.width / 2) / view.zoom,
            startY: (rect.top - containerRect.top + rect.height / 2) / view.zoom
        });
    };

    const handlePinMouseUp = (e, nodeId, pinId, type) => {
        if (!wireStart || !isAdmin) return;
        e.stopPropagation();

        if (wireStart.nodeId !== nodeId && wireStart.type !== type) {
            const isDataWire = wireStart.isData || pinId.includes('data') || pinId.includes('delta');
            const newConnection = {
                id: `conn_${Date.now()}`,
                from: wireStart.type === 'out' ? wireStart.nodeId : nodeId,
                fromPin: wireStart.type === 'out' ? wireStart.pinId : pinId,
                to: wireStart.type === 'in' ? wireStart.nodeId : nodeId,
                toPin: wireStart.type === 'in' ? wireStart.pinId : pinId,
                isData: isDataWire
            };
            updateConnections([...connections, newConnection]);
        }
        setWireStart(null);
    };

    const handleDrop = (e) => {
        if (!isAdmin) return;
        e.preventDefault();
        const data = e.dataTransfer.getData('project_asset');
        if (!data) return;

        try {
            const project = JSON.parse(data);
            const containerRect = containerRef.current.getBoundingClientRect();
            const worldX = (e.clientX - containerRect.left - view.x);
            const worldY = (e.clientY - containerRect.top - view.y);

            const newNode = {
                id: `node_proj_${Date.now()}`,
                type: 'project',
                title: `P_${project.title}`,
                subtitle: "Project Asset",
                description: project.description || "Project details...",
                image: project.image, // CRITICAL: for preview
                x: worldX,
                y: worldY,
                category: 'other',
                projectId: project.id
            };
            updateNodes([...nodes, newNode]);
        } catch (err) {
            console.error("Failed to drop project asset", err);
        }
    };

    const handleDragOver = (e) => {
        if (!isAdmin) return;
        e.preventDefault();
    };

    const deleteNode = (id) => {
        if (!isAdmin) return;
        updateNodes(nodes.filter(n => n.id !== id));
        updateConnections(connections.filter(c => c.from !== id && c.to !== id));
    };

    // Mouse handlers
    const handleMouseDown = (e) => {
        if (activeProject) return;

        // Panning: Middle mouse (1) or Left mouse (0) on background
        // Check if target is container OR the scaling layer (the background)
        const isBackground = e.target === containerRef.current || e.target.classList.contains(styles.scalingLayer);

        if (e.button === 1 || (e.button === 0 && isBackground)) {
            if (e.button === 1) e.preventDefault(); // Prevent scroll icon
            setIsPanning(true);
            clearSelection();
            setWireStart(null);
        }
    };

    // Touch handlers for Mobile Panning
    const lastTouchRef = useRef(null);

    const handleTouchStart = (e) => {
        if (activeProject || e.touches.length !== 1) return;
        const touch = e.touches[0];
        // Only pan if touching background
        const isBackground = e.target === containerRef.current || e.target.classList.contains(styles.scalingLayer);

        if (isBackground) {
            setIsPanning(true);
            lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
            clearSelection();
            setWireStart(null);
        }
    };

    const handleTouchMove = (e) => {
        if (!isPanning || !lastTouchRef.current || e.touches.length !== 1) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchRef.current.x;
        const deltaY = touch.clientY - lastTouchRef.current.y;

        setView(prev => ({
            ...prev,
            x: prev.x + deltaX / prev.zoom,
            y: prev.y + deltaY / prev.zoom
        }));

        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => {
        setIsPanning(false);
        lastTouchRef.current = null;
    };

    const handleMouseMove = (e) => {
        const currentView = viewRef.current;
        const currentNodes = nodesRef.current;

        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
            setMousePos({
                x: (e.clientX - containerRect.left) / currentView.zoom,
                y: (e.clientY - containerRect.top) / currentView.zoom
            });
        }

        if (isPanning) {
            setView(prev => ({
                ...prev,
                x: prev.x + e.movementX / prev.zoom,
                y: prev.y + e.movementY / prev.zoom
            }));
        }

        if (isAdmin && draggingNodeId) {
            const updated = currentNodes.map(node => {
                if (node.id === draggingNodeId) {
                    return {
                        ...node,
                        x: node.x + e.movementX / currentView.zoom,
                        y: node.y + e.movementY / currentView.zoom
                    };
                }
                return node;
            });
            setNodesLocal(updated); // Use local update for smooth drag
        }

        if (isAdmin && resizingNodeId) {
            const updated = currentNodes.map(node => {
                if (node.id === resizingNodeId) {
                    return {
                        ...node,
                        width: Math.max(100, (node.width || 300) + e.movementX / currentView.zoom),
                        height: Math.max(100, (node.height || 200) + e.movementY / currentView.zoom)
                    };
                }
                return node;
            });
            setNodesLocal(updated);
        }
    };

    const handleMouseUp = () => {
        // Persist final position if we were dragging
        if (isAdmin && (draggingNodeId || resizingNodeId)) {
            updateNodes(nodesRef.current); // Persist current state from Ref
        }

        setIsPanning(false);
        setDraggingNodeId(null);
        setResizingNodeId(null);
        setWireStart(null);
    };

    // Global Event Listeners for Dragging/Panning
    useEffect(() => {
        if (isPanning || draggingNodeId || resizingNodeId || wireStart) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isPanning, draggingNodeId, resizingNodeId, wireStart]); // Removed handleMouseMove dependency as it is now stable (if defined outside or via ref, but here it depends on setView etc which is stable)

    const handleResizeMouseDown = (e, nodeId) => {
        e.stopPropagation();
        setResizingNodeId(nodeId);
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const containerRect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;

        const delta = e.deltaY > 0 ? -0.1 : 0.1;

        setView(prev => {
            const newZoom = Math.max(0.3, Math.min(2, prev.zoom + delta));
            // NewPanX = OldPanX + (MouseX / NewZoom - MouseX / OldZoom)
            return {
                zoom: newZoom,
                x: prev.x + (mouseX / newZoom - mouseX / prev.zoom),
                y: prev.y + (mouseY / newZoom - mouseY / prev.zoom)
            };
        });
    };

    const handleExport = () => {
        const json = JSON.stringify({ nodes, connections }, null, 2);
        navigator.clipboard.writeText(json);
        alert("Blueprint Data copied to clipboard!");
    };

    const handleNodeMouseDown = (e, nodeId) => {
        e.stopPropagation();
        setDraggingNodeId(nodeId);

        if (isAdmin) {
            setNeedsCompile(true);
            setIsCompiled(false);
        }

        const node = nodes.find(n => n.id === nodeId);
        selectNode(node);
    };

    const handleCompile = () => {
        setIsCompiled(false);
        setTimeout(() => {
            setIsCompiled(true);
            setNeedsCompile(false);
        }, 800);
    };

    const activeNodeIds = React.useMemo(() => {
        if (!isSimulating) return new Set();
        const active = new Set();
        nodes.forEach(n => {
            if (n.type === 'tick' || n.type === 'beginplay' || n.category === 'event') {
                active.add(n.id);
            }
        });

        let changed = true;
        let iter = 0;
        while (changed && iter < 100) {
            changed = false;
            iter++;
            connections.forEach(c => {
                if (active.has(c.from) && !active.has(c.to)) {
                    active.add(c.to);
                    changed = true;
                }
            });
        }
        return active;
    }, [isSimulating, nodes, connections]);

    const renderConnections = () => {
        return connections.map((conn, idx) => {
            const start = nodes.find(n => n.id === conn.from);
            const end = nodes.find(n => n.id === conn.to);
            if (!start || !end) return null;

            const isFromSelected = selection?.data?.id === start.id;
            const isFromTick = start.title.toLowerCase().includes('tick');
            const isDebug = !isAdmin && isFromSelected;

            const isGet = start.type === 'variable' || (start.category === 'variable' && start.type !== 'variable_set');
            const isSet = start.type === 'variable_set';
            const isSequence = start.type === 'sequence';
            const startWidth = isGet ? 180 : isSet ? 220 : isSequence ? 160 : 280;

            // Calculate Y offset based on pin type and sequence pin index
            let startYOffset = 45;
            if (start.type === 'project') {
                startYOffset = 49; // Adjusted for Project Node pin alignment
            } else if (conn.fromPin?.includes('data') || conn.fromPin?.includes('delta')) {
                startYOffset = isGet ? 50 : 68;
            } else if (conn.fromPin?.startsWith('out_then_')) {
                // Sequence node: Each "Then X" pin has its own vertical offset
                const pinIndex = parseInt(conn.fromPin.split('_')[2]);
                startYOffset = 45 + (pinIndex * 26); // 26px spacing between pins
            }

            const endYOffset = conn.toPin?.includes('data') ? 68 : 45;

            const startPos = { x: start.x + view.x + (startWidth - 20), y: start.y + view.y + startYOffset };
            const endPos = { x: end.x + view.x + 20, y: end.y + view.y + endYOffset };

            const isLive = isSimulating && activeNodeIds.has(conn.from);
            const isProject = start.type === 'project';

            return (
                <GraphConnection
                    key={`conn-${idx}`}
                    start={startPos}
                    end={endPos}
                    isDebug={isDebug}
                    isData={conn.isData}
                    isLive={isLive}
                    isProject={isProject}
                />
            );
        });
    };

    if (activeProject) {
        if (isEditing) {
            return (
                <ProjectEditor
                    project={activeProject}
                    onSave={saveProjectFile}
                    onCancel={() => setIsEditing(false)}
                />
            );
        }
        return <ProjectWindow project={activeProject} />;
    }

    return (
        <div
            className={styles.graphContainer}
            style={{ backgroundPosition: `${view.x}px ${view.y}px` }}
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseUp}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Toolbar Area */}
            <div className={styles.palette}>
                {isAdmin && (
                    <div className={styles.compileArea}>
                        <button
                            onClick={handleCompile}
                            className={`${styles.compileBtn} ${needsCompile ? styles.needsCompile : ''}`}
                        >
                            {isCompiled ? '✔️ Compile' : '⏳ Compiling...'}
                        </button>
                    </div>
                )}
                {isAdmin && <div className={styles.paletteDivider} />}

                <div className={styles.paletteHeader}>SIMULATION</div>
                <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    style={{ background: isSimulating ? '#4a8e2d' : '#333', color: isSimulating ? 'white' : '#ddd', fontWeight: 'bold', marginBottom: isAdmin ? 8 : 0 }}
                >
                    {isSimulating ? '■ STOP EXECUTION' : '▶ EXECUTE PROCESS'}
                </button>

                {isAdmin && (
                    <>
                        <div className={styles.paletteDivider} />
                        <div className={styles.paletteHeader}>PALETTE</div>
                        <button onClick={() => spawnNode('beginplay', 'event')}>+ Event BeginPlay</button>
                        <button onClick={() => spawnNode('event', 'event')}>+ Event Custom</button>
                        <button onClick={() => spawnNode('tick', 'event')}>+ Event Tick</button>
                        <button onClick={() => spawnNode('comment', 'other')}>+ Comment</button>
                        <button onClick={() => spawnNode('sequence', 'utility')}>+ Sequence</button>
                        <button onClick={() => spawnNode('project', 'other')}>+ Project Asset</button>
                        <button onClick={() => spawnNode('function', 'function')}>+ Function</button>
                        <button onClick={() => spawnNode('variable', 'variable')}>+ Variable (GET)</button>
                        <button onClick={() => spawnNode('variable_set', 'variable')}>+ Variable (SET)</button>
                        <div className={styles.paletteDivider} />
                        <button onClick={handleExport} className={styles.exportBtn}>COPY DATA</button>
                    </>
                )}
            </div>



            <div className={styles.scalingLayer} style={{ transform: `scale(${view.zoom})`, transformOrigin: '0 0' }}>
                {renderConnections()}

                {nodes.map(node => (
                    <div
                        key={node.id}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            transform: `translate(${view.x + node.x}px, ${view.y + node.y}px)`
                        }}
                    >
                        <DraggableNode
                            data={node}
                            isSelected={selection?.data?.id === node.id}
                            onClick={(e) => handleNodeMouseDown(e, node.id)}
                            onPinMouseDown={handlePinMouseDown}
                            onPinMouseUp={handlePinMouseUp}
                            onDelete={() => deleteNode(node.id)}
                            isWiring={!!wireStart}
                            onResizeMouseDown={handleResizeMouseDown}
                        />
                        {isAdmin && <div className={styles.nodeCoords}>({Math.round(node.x)}, {Math.round(node.y)})</div>}
                    </div>
                ))}

                {/* Live Wire */}
                {wireStart && (
                    <GraphConnection
                        start={{ x: wireStart.startX, y: wireStart.startY }}
                        end={{ x: mousePos.x, y: mousePos.y }}
                        isLive
                    />
                )}
            </div>

            <div className={styles.hintBox}>
                <strong>Blueprint Editor</strong>
                <div style={{ fontSize: 10, color: '#aaa' }}>Right-click/Middle-click BG to pan. Drag pins to connect.</div>
            </div>
        </div >
    );
};
