import React, { createContext, useState, useContext, useEffect } from 'react';
import { projectsData as initialProjects } from '../data/projects';
import { careerNodes as initialNodes } from '../data/career';
import { ADMIN_CONFIG } from '../config/admin';
import { profileData } from '../data/profile';

const SelectionContext = createContext();

export const SelectionProvider = ({ children }) => {
    const [selection, setSelection] = useState(null);
    const [projects, setProjects] = useState(() => {
        try {
            const saved = localStorage.getItem('unreal_portfolio_projects');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    // Merge logic: 
                    // 1. Map over stored projects. If they exist in initialProjects (code), update valid metadata from code.
                    // 2. Add any initialProjects that are NOT in stored.
                    const merged = parsed.map(p => {
                        const codeProj = initialProjects.find(ip => ip.id === p.id);
                        if (codeProj) {
                            // Update metadata from code, preserve local override if we tracked it (we don't yet).
                            // Preserving 'content' and 'details' if they were edited locally is tricky, 
                            // but usually metadata in projects.js should be source of truth for structure.
                            return {
                                ...p,
                                ...codeProj,
                                // valid overrides from local state could go here if we had them.
                                // For now, assume code is source of truth for metadata.
                            };
                        }
                        return p;
                    });

                    initialProjects.forEach(initProj => {
                        if (!merged.find(p => p.id === initProj.id)) {
                            console.log(`[SelectionContext] Merging new code-based project: ${initProj.id}`);
                            merged.push(initProj);
                        }
                    });
                    return merged;
                }
            }
        } catch (e) {
            console.error("SelectionContext: Failed to parse projects from localStorage", e);
        }
        return initialProjects;
    });

    const [activeBlueprintId, setActiveBlueprintId] = useState('EventGraph');
    const [isSimulating, setIsSimulating] = useState(false);

    const [careerNodes, setCareerNodes] = useState(() => {
        try {
            const saved = localStorage.getItem('unreal_career_nodes_list');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return initialNodes;
    });

    // SKILLS (VARIABLES) STATE
    const [skills, setSkills] = useState(() => {
        try {
            const saved = localStorage.getItem('unreal_portfolio_skills');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        // Fallback to profile Data
        return profileData.variables || [];
    });

    const addSkill = (name, type) => {
        const newSkill = { name, type };
        const updated = [...skills, newSkill];
        setSkills(updated);
        localStorage.setItem('unreal_portfolio_skills', JSON.stringify(updated));
    };

    const deleteSkill = (index) => {
        const updated = skills.filter((_, i) => i !== index);
        setSkills(updated);
        localStorage.setItem('unreal_portfolio_skills', JSON.stringify(updated));
    };


    const addCareerNode = (title) => {
        const newNode = {
            id: `node_${Date.now()}`,
            type: 'function',
            title: title || "New Company",
            subtitle: "Company Details",
            description: "Dedicated project graph",
            year: new Date().getFullYear(),
            x: 0,
            y: 0
        };
        const updated = [...careerNodes, newNode];
        setCareerNodes(updated);
        localStorage.setItem('unreal_career_nodes_list', JSON.stringify(updated));
        // Switch to the new graph immediately
        setActiveBlueprintId(`graph-${newNode.id}`);
    };

    // FOLDER STATE (CONTENT BROWSER)
    const [folders, setFolders] = useState(() => {
        try {
            const saved = localStorage.getItem('unreal_portfolio_folders');
            if (saved) return JSON.parse(saved);
        } catch (e) { }
        return [
            { id: 'content', name: 'Content', parentId: null },
            { id: 'projects', name: 'Projects', parentId: 'content' }
        ];
    });

    const addFolder = (name, parentId) => {
        const newFolder = {
            id: `folder_${Date.now()}`,
            name: name || "NewFolder",
            parentId: parentId || 'content' // Always a child of at least 'content'
        };
        const updated = [...folders, newFolder];
        setFolders(updated);
        localStorage.setItem('unreal_portfolio_folders', JSON.stringify(updated));
        return newFolder;
    };

    const deleteFolder = (id) => {
        // Prevent deleting root or the default Projects folder as per user structure preference
        if (id === 'content' || id === 'projects') return;

        // Find all sub-folders recursively to delete them too? 
        // For now, let's just delete the target and orphaned items will be hidden.
        const updated = folders.filter(f => f.id !== id);
        setFolders(updated);
        localStorage.setItem('unreal_portfolio_folders', JSON.stringify(updated));
    };


    const deleteCareerNode = (id) => {
        console.log(`[SelectionContext] Deleting career node: ${id}`);
        // Ensure ID comparison is type-safe (both strings) -> This is critical if IDs come from DOM attributes
        const updated = careerNodes.filter(n => String(n.id) !== String(id));
        setCareerNodes(updated);
        localStorage.setItem('unreal_career_nodes_list', JSON.stringify(updated));

        // If we were looking at this graph, switch back to main
        if (activeBlueprintId === `graph-${id}`) {
            setActiveBlueprintId('EventGraph');
        }
    };

    // Nodes state with Persistence
    const [nodes, setNodes] = useState([]);
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        try {
            const nodeKey = `unreal_nodes_${activeBlueprintId}`;
            const connKey = `unreal_conns_${activeBlueprintId}`;

            const savedNodes = localStorage.getItem(nodeKey);
            const savedConns = localStorage.getItem(connKey);

            if (savedNodes) {
                setNodes(JSON.parse(savedNodes));
            } else if (activeBlueprintId === 'EventGraph') {
                setNodes(careerNodes);
            } else {
                setNodes([]);
            }

            if (savedConns) {
                setConnections(JSON.parse(savedConns));
            } else {
                setConnections([]);
            }
        } catch (e) {
            console.error("Failed to switch blueprint", e);
        }
    }, [activeBlueprintId]);

    const saveNodes = (newNodes) => {
        setNodes(newNodes);
        localStorage.setItem(`unreal_nodes_${activeBlueprintId}`, JSON.stringify(newNodes));
    };

    const setNodesLocal = (newNodes) => {
        setNodes(newNodes);
    };

    const updateConnections = (newConnections) => {
        setConnections(newConnections);
        localStorage.setItem(`unreal_conns_${activeBlueprintId}`, JSON.stringify(newConnections));
    };

    const saveNodePosition = (id, x, y) => {
        const newNodes = nodes.map(n => n.id === id ? { ...n, x, y } : n);
        saveNodes(newNodes);
    };

    const [activeProject, setActiveProject] = useState(null);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [tabs, setTabs] = useState([]);
    const [activeTabId, setActiveTabId] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [fontSize, setFontSize] = useState('medium');
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('unreal_portfolio_user');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });
    const [isEditing, setIsEditing] = useState(false);

    // Confirmation State
    const [confirmationState, setConfirmationState] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
        isDanger: false
    });

    const requestConfirmation = ({ title, message, onConfirm, isDanger = false }) => {
        setConfirmationState({
            isOpen: true,
            title,
            message,
            onConfirm,
            isDanger
        });
    };

    const closeConfirmation = () => {
        setConfirmationState(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirm = () => {
        if (confirmationState.onConfirm) {
            confirmationState.onConfirm();
        }
        closeConfirmation();
    };

    const saveProjectFile = async (projectData) => {
        // AGENT TASK: I will detect this log and write to s:/ProgramsExtension/UnrealPortfolioPage/src/content/projects/[id].md
        console.log("CRITICAL_SAVE_SIGNAL:", projectData.id, projectData.content);

        const updated = projects.map(p => p.id === projectData.id ? projectData : p);
        if (!projects.find(p => p.id === projectData.id)) {
            updated.push(projectData);
        }
        setProjects(updated);
        localStorage.setItem('unreal_portfolio_projects', JSON.stringify(updated));

        // Update tabs as well
        setTabs(tabs.map(t => t.id === projectData.id ? projectData : t));

        setIsEditing(false);
        return projectData;
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-font-size', fontSize);
    }, [fontSize]);

    const selectNode = (node) => setSelection({ type: 'node', data: node });
    const selectProject = (project) => setSelection({ type: 'project', data: project });
    const clearSelection = () => setSelection(null);

    const openProjectViewer = (project) => {
        setActiveProject(project);
        openTab(project);
    };
    const closeProjectViewer = () => setActiveProject(null);

    const openContact = () => setIsContactOpen(true);
    const closeContact = () => setIsContactOpen(false);

    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);

    const openTab = (project) => {
        if (!tabs.find(t => t.id === project.id)) {
            setTabs([...tabs, project]);
        }
        setActiveTabId(project.id);
    };

    const addProject = (confirmData) => {
        const newProject = {
            id: `proj${Date.now()}`,
            image: "https://via.placeholder.com/300/000000/FFFFFF/?text=New+Project",
            link: "#",
            tags: ["MAIN"],
            folderId: confirmData.folderId || 'projects',
            ...confirmData
        };
        const updated = [...projects, newProject];
        setProjects(updated);
        localStorage.setItem('unreal_portfolio_projects', JSON.stringify(updated));

        // Atomically open and edit
        setTabs(prev => [...prev, newProject]);
        setActiveTabId(newProject.id);
        setIsEditing(true);

        return newProject;
    };

    const deleteProject = (id) => {
        console.log(`[SelectionContext] Deleting project: ${id}`);
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        localStorage.setItem('unreal_portfolio_projects', JSON.stringify(updated));

        // Close tab if open
        if (tabs.find(t => t.id === id)) {
            closeTab(id);
        }
    };

    const closeTab = (id) => {
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
        }
    };

    const reorderTabs = (newTabs) => setTabs(newTabs);

    const login = (userData, provider) => {
        console.log(`Login Attempt [${provider}]:`, userData.email);
        if (!ADMIN_CONFIG.authorizedEmails.includes(userData.email)) {
            console.warn("ADMIN REJECTION: Unauthorized email detected.");
            // We use a small timeout to ensure the OAuth popup closure doesn't interfere with the alert
            setTimeout(() => {
                alert("You are not admin!!! GET OUT! JESUS LOVE U! GO TO THE CHURCH!!!");
            }, 100);
            return;
        }
        console.log("LOGIN SUCCESS: Admin authorized.");
        const fullUser = { ...userData, provider };
        setUser(fullUser);
        localStorage.setItem('unreal_portfolio_user', JSON.stringify(fullUser));
    };
    const logout = () => {
        setUser(null);
        localStorage.removeItem('unreal_portfolio_user');
    };


    const isAdmin = user?.email && ADMIN_CONFIG.authorizedEmails.includes(user.email);

    return (
        <SelectionContext.Provider value={{
            selection, selectNode, selectProject, clearSelection,
            activeProject, openProjectViewer, closeProjectViewer,
            isContactOpen, openContact, closeContact,
            isSettingsOpen, openSettings, closeSettings,
            isSidebarOpen, toggleSidebar: () => setIsSidebarOpen(!isSidebarOpen),
            tabs, activeTabId, setActiveTabId, openTab, closeTab, reorderTabs,
            theme, setTheme, fontSize, setFontSize,
            user, login, logout, isAdmin,
            projects, addProject, deleteProject,
            activeBlueprintId, setActiveBlueprintId,
            isEditing, setIsEditing, saveProjectFile,
            nodes, updateNodes: saveNodes, setNodesLocal,
            updateNode: (id, updates) => {
                const newNodes = nodes.map(n => n.id === id ? { ...n, ...updates } : n);
                saveNodes(newNodes);
            },
            saveNodePosition,
            connections, updateConnections,
            careerNodes, addCareerNode, deleteCareerNode,
            skills, addSkill, deleteSkill,
            folders, addFolder, deleteFolder,
            openProject: (projectId) => {
                const proj = projects.find(p => p.id === projectId);
                if (proj) openTab(proj);
            },
            isSimulating, setIsSimulating,
            confirmationState, requestConfirmation, closeConfirmation, handleConfirm
        }}>
            {children}
        </SelectionContext.Provider>
    );
};

export const useSelection = () => useContext(SelectionContext);
