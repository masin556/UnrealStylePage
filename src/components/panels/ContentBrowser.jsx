import React, { useState, useRef, useEffect } from 'react';
import styles from './ContentBrowser.module.css';
import { useSelection } from '../../context/SelectionContext';
import { useToast } from '../../context/ToastContext';
import { Folder, FileCode, Image as ImageIcon, Search, LayoutGrid, List, Plus, Trash, ChevronRight } from 'lucide-react';
import { CreateProjectModal } from '../common/CreateProjectModal';
import { InputModal } from '../common/InputModal';

export const ContentBrowser = () => {
    const {
        projects, deleteProject, isAdmin, requestConfirmation, openProject, folders, addFolder, deleteFolder, addProject
    } = useSelection();
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [panelHeight, setPanelHeight] = useState(300);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState({ content: true });
    const isResizing = useRef(false);

    // Navigation State (using IDs)
    const [currentPathIds, setCurrentPathIds] = useState(['content']);

    const toggleFolder = (e, folderId) => {
        e.stopPropagation();
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const currentFolderId = currentPathIds[currentPathIds.length - 1];
    const currentFolder = folders.find(f => f.id === currentFolderId) || folders[0];

    // Handle Folder Navigation
    const handleNavigate = (folderId) => {
        setCurrentPathIds([...currentPathIds, folderId]);
        // Auto-expand when navigating to it
        setExpandedFolders(prev => ({ ...prev, [folderId]: true }));
    };

    const handleBreadcrumbClick = (index) => {
        setCurrentPathIds(currentPathIds.slice(0, index + 1));
    };

    // Filter Logic
    const childFolders = folders.filter(f => f.parentId === currentFolderId);
    const childProjects = projects.filter(p => {
        const pFolderId = p.folderId || 'projects';
        return pFolderId === currentFolderId;
    });

    // Searching (UE style: search shows everything regardless of folder if searching)
    const filteredFolders = searchQuery ? folders.filter(f => f.id !== 'content' && f.name.toLowerCase().includes(searchQuery.toLowerCase())) : childFolders;
    const filteredProjects = searchQuery ? projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : childProjects;

    const handleDragStart = (e, item, type) => {
        if (!isAdmin) return;
        e.dataTransfer.setData(type, JSON.stringify(item));
    };

    // Resizing Logic
    const resizeRef = useRef({ isResizing: false, startY: 0, startHeight: 0 });

    const startResize = (e) => {
        e.preventDefault();
        resizeRef.current = {
            isResizing: true,
            startY: e.clientY,
            startHeight: panelHeight
        };
        document.body.style.cursor = 'ns-resize';
        document.body.classList.add('is-resizing'); // Global class for cursor safety
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizeRef.current.isResizing) return;

            const deltaY = resizeRef.current.startY - e.clientY;
            let newHeight = resizeRef.current.startHeight + deltaY;

            // Sensible constraints: 
            // Min 100px
            // Max viewport height minus TopBar and some Graph Space (e.g. 250px)
            const maxHeight = window.innerHeight - 250;

            if (newHeight < 100) newHeight = 100;
            if (newHeight > maxHeight) newHeight = maxHeight;

            setPanelHeight(newHeight);
        };
        const handleMouseUp = () => {
            if (resizeRef.current.isResizing) {
                resizeRef.current.isResizing = false;
                document.body.style.cursor = 'default';
                document.body.classList.remove('is-resizing');
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []); // Only the effect setup

    // Recursive sidebar item helper
    const renderTree = (parentId, level = 0) => {
        if (!expandedFolders[parentId]) return null;

        const children = folders.filter(f => f.parentId === parentId);
        return children.map(folder => {
            const hasChildren = folders.some(f => f.parentId === folder.id);
            const isExpanded = expandedFolders[folder.id];

            return (
                <React.Fragment key={folder.id}>
                    <div
                        className={`${styles.treeItem} ${currentFolderId === folder.id ? styles.activeTree : ''}`}
                        onClick={() => setCurrentPathIds(getPathToRoot(folder.id))}
                        style={{ paddingLeft: `${8 + (level + 1) * 12}px` }}
                    >
                        <div
                            className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
                            onClick={(e) => toggleFolder(e, folder.id)}
                            style={{ visibility: hasChildren ? 'visible' : 'hidden', marginRight: 4 }}
                        >
                            <ChevronRight size={10} />
                        </div>
                        <Folder size={14} fill={currentFolderId === folder.id ? "#e5c07b" : "none"} color={currentFolderId === folder.id ? "#e5c07b" : "#ccc"} />
                        <span>{folder.name}</span>

                        {isAdmin && folder.id !== 'projects' && (
                            <div className={styles.treeActions}>
                                <Trash
                                    size={10}
                                    className={styles.deleteIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        requestConfirmation({
                                            title: "Delete Folder",
                                            message: `Delete folder '${folder.name}' and all its contents?`,
                                            isDanger: true,
                                            onConfirm: () => {
                                                deleteFolder(folder.id);
                                                if (currentPathIds.includes(folder.id)) {
                                                    setCurrentPathIds(['content']);
                                                }
                                                addToast(`Deleted ${folder.name}`, 'success');
                                            }
                                        });
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    {renderTree(folder.id, level + 1)}
                </React.Fragment>
            );
        });
    };

    const getPathToRoot = (folderId) => {
        const path = [];
        let curr = folders.find(f => f.id === folderId);
        while (curr) {
            path.unshift(curr.id);
            curr = folders.find(f => f.id === curr.parentId);
        }
        return path;
    };

    return (
        <div
            className={styles.container}
            style={{ '--content-browser-height': `${panelHeight}px` }}
        >
            <div className={styles.resizer} onMouseDown={startResize} />

            <div className={styles.toolbar}>
                <div style={{ position: 'relative' }}>
                    <button
                        className={styles.addBtn}
                        onClick={() => setShowAddMenu(!showAddMenu)}
                    >
                        <Plus size={14} style={{ marginRight: 4 }} />
                        Add
                    </button>
                    {showAddMenu && (
                        <div className={styles.addMenu} onMouseLeave={() => setShowAddMenu(false)}>
                            <div className={styles.menuItem} onClick={() => { setIsCreateOpen(true); setShowAddMenu(false); }}>
                                <FileCode size={14} />
                                <span>Blueprint Class</span>
                            </div>
                            <div className={styles.menuItem} onClick={() => { setIsAddingFolder(true); setShowAddMenu(false); }}>
                                <Folder size={14} />
                                <span>Folder</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.path}>
                    <Folder size={14} className={styles.icon} />
                    {currentPathIds.map((id, index) => {
                        const folder = folders.find(f => f.id === id);
                        return (
                            <React.Fragment key={id}>
                                <span
                                    onClick={() => handleBreadcrumbClick(index)}
                                    className={styles.breadcrumb}
                                >
                                    {folder?.name}
                                </span>
                                {index < currentPathIds.length - 1 && <span className={styles.separator}>/</span>}
                            </React.Fragment>
                        );
                    })}
                </div>
                <div className={styles.search}>
                    <Search size={12} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search Assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.viewOptions}>
                    <LayoutGrid
                        size={14}
                        className={styles.viewIcon}
                        style={{ opacity: viewMode === 'grid' ? 1 : 0.5 }}
                        onClick={() => setViewMode('grid')}
                    />
                    <List
                        size={14}
                        className={styles.viewIcon}
                        style={{ opacity: viewMode === 'list' ? 1 : 0.5 }}
                        onClick={() => setViewMode('list')}
                    />
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.sidebar}>
                    {/* Render root */}
                    <div
                        className={`${styles.treeItem} ${currentFolderId === 'content' ? styles.activeTree : ''}`}
                        onClick={() => setCurrentPathIds(['content'])}
                        style={{ paddingLeft: '8px' }}
                    >
                        <div
                            className={`${styles.chevron} ${expandedFolders.content ? styles.expanded : ''}`}
                            onClick={(e) => toggleFolder(e, 'content')}
                            style={{ marginRight: 4 }}
                        >
                            <ChevronRight size={10} />
                        </div>
                        <Folder size={14} fill={currentFolderId === 'content' ? "#e5c07b" : "none"} color={currentFolderId === 'content' ? "#e5c07b" : "#ccc"} />
                        <span>Content</span>
                    </div>
                    {renderTree('content')}
                </div>

                <div className={`${styles.assetGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
                    {/* HEADERS FOR LIST VIEW */}
                    {viewMode === 'list' && (filteredFolders.length > 0 || filteredProjects.length > 0) && (
                        <div className={styles.listRow} style={{ fontWeight: 'bold', background: '#222', borderBottom: '2px solid #333' }}>
                            <span></span>
                            <span>Name</span>
                            <span>Description</span>
                            <span>Type</span>
                        </div>
                    )}

                    {/* FOLDERS */}
                    {filteredFolders.map(folder => (
                        viewMode === 'grid' ? (
                            <div
                                key={folder.id}
                                className={styles.asset}
                                onDoubleClick={() => handleNavigate(folder.id)}
                            >
                                <div className={styles.assetPreview} style={{ background: 'none', border: 'none' }}>
                                    <Folder size={64} fill="#e5c07b" stroke="#dcb67a" />
                                    {isAdmin && folder.id !== 'projects' && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                requestConfirmation({
                                                    title: "Delete Folder",
                                                    message: `Delete folder '${folder.name}' and all its contents?`,
                                                    isDanger: true,
                                                    onConfirm: () => {
                                                        deleteFolder(folder.id);
                                                        addToast(`Deleted ${folder.name}`, 'success');
                                                    }
                                                });
                                            }}
                                        >
                                            <Trash size={12} color="white" />
                                        </button>
                                    )}
                                </div>
                                <div className={styles.assetLabel}>
                                    <span className={styles.assetName}>{folder.name}</span>
                                    <span className={styles.assetType}>Folder</span>
                                </div>
                            </div>
                        ) : (
                            <div
                                key={folder.id}
                                className={styles.listRow}
                                onDoubleClick={() => handleNavigate(folder.id)}
                            >
                                <Folder size={14} className={styles.listIcon} color="#e5c07b" />
                                <span>{folder.name}</span>
                                <span style={{ opacity: 0.5 }}>-</span>
                                <span style={{ opacity: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    Folder
                                    {isAdmin && folder.id !== 'projects' && (
                                        <Trash
                                            size={12}
                                            className={styles.deleteIcon}
                                            style={{ cursor: 'pointer', opacity: 0.5 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                requestConfirmation({
                                                    title: "Delete Folder",
                                                    message: `Delete folder '${folder.name}'?`,
                                                    isDanger: true,
                                                    onConfirm: () => deleteFolder(folder.id)
                                                });
                                            }}
                                        />
                                    )}
                                </span>
                            </div>
                        )
                    ))}

                    {/* ASSETS */}
                    {filteredProjects.map(project => (
                        viewMode === 'grid' ? (
                            <div
                                key={project.id}
                                className={styles.asset}
                                draggable={isAdmin}
                                onDragStart={(e) => handleDragStart(e, project, 'project_asset')}
                                onDoubleClick={() => openProject(project.id)}
                            >
                                <div className={styles.assetPreview}>
                                    <img
                                        src={project.image || '/Images/ActorImage.png'}
                                        alt={project.title}
                                        className={styles.assetImg}
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/Images/ActorImage.png'; }}
                                    />
                                    <div className={styles.blueBar} />
                                    <div className={styles.assetOverlay}>
                                        <FileCode size={16} color="white" />
                                    </div>
                                    {isAdmin && (
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                requestConfirmation({
                                                    title: "Delete Project",
                                                    message: `Delete '${project.title}'?`,
                                                    isDanger: true,
                                                    onConfirm: () => {
                                                        deleteProject(project.id);
                                                        addToast(`Deleted ${project.title}`, 'success');
                                                    }
                                                });
                                            }}
                                        >
                                            <Trash size={12} color="white" />
                                        </button>
                                    )}
                                </div>
                                <div className={styles.assetLabel}>
                                    <span className={styles.assetName}>P_{project.title}</span>
                                    <span className={styles.assetType}>Project Asset</span>
                                </div>
                            </div>
                        ) : (
                            <div
                                key={project.id}
                                className={styles.listRow}
                                onDoubleClick={() => openProject(project.id)}
                            >
                                <FileCode size={14} className={styles.listIcon} />
                                <span>P_{project.title}</span>
                                <span style={{ opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {project.description}
                                </span>
                                <span style={{ opacity: 0.5 }}>{project.category || 'Project Asset'}</span>
                            </div>
                        )
                    ))}
                    {filteredFolders.length === 0 && filteredProjects.length === 0 && (
                        <div className={styles.empty}>This folder is empty</div>
                    )}
                </div>
            </div>

            <div className={styles.statusBar}>
                <span>{filteredFolders.length + filteredProjects.length} items</span>
            </div>

            <CreateProjectModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={(data) => addProject({ ...data, folderId: currentFolderId })}
            />

            <InputModal
                isOpen={isAddingFolder}
                onClose={() => setIsAddingFolder(false)}
                onSubmit={(name) => {
                    if (name) addFolder(name, currentFolderId);
                    setIsAddingFolder(false);
                }}
                title="Create New Folder"
                placeholder="Enter folder name"
            />
        </div>
    );
};
