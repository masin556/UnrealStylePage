import React, { useState } from 'react';
import { profileData } from '../../data/profile';
import { careerNodes } from '../../data/career';
import styles from './Sidebar.module.css';
import { useSelection } from '../../context/SelectionContext';
import { useToast } from '../../context/ToastContext';
import { User, FileText, Settings, Download, LogIn, LogOut, Search, Plus, ChevronDown, ChevronRight, Trash } from 'lucide-react';
import { ADMIN_CONFIG } from '../../config/admin';
import { CreateSkillModal } from '../common/CreateSkillModal';
import { InputModal } from '../common/InputModal';
import resumeUrl from '../../assets/Resume.pdf';

export const Sidebar = () => {
    const { user, isAdmin, activeBlueprintId, setActiveBlueprintId, careerNodes, addCareerNode, deleteCareerNode, requestConfirmation, skills, addSkill, deleteSkill } = useSelection();
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [expanded, setExpanded] = useState({ graphs: true, functions: true, variables: true });
    const [isAddingCompany, setIsAddingCompany] = useState(false);
    const [isAddingSkill, setIsAddingSkill] = useState(false);

    const toggleExpand = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

    const handleAddCompany = (e) => {
        e.stopPropagation();
        if (!isAdmin) return;
        setIsAddingCompany(true);
    };

    const onCompanySubmit = (name) => {
        if (name) addCareerNode(name);
        setIsAddingCompany(false);
    };

    // Filter career nodes
    const displayedCareer = careerNodes.filter(node =>
        !['node1', 'node2', 'node3'].includes(node.id) || node.title.includes('FTS GLOBAL')
    );

    return (
        <div className={styles.container}>
            <div className={styles.sectionHeader}>
                <span>{isAdmin ? 'COMPONENTS' : 'Profile'}</span>
                <Plus size={14} className={styles.headerIcon} />
            </div>

            <div className={styles.profileSection}>
                <div className={styles.avatarContainer}>
                    <div className={styles.avatar}>
                        {(user?.profile_image || profileData.image) && !(user?.profile_image || profileData.image).includes('placeholder') ? (
                            <img src={user?.profile_image || profileData.image} alt="Profile" className={styles.avatarImg} />
                        ) : (
                            <User size={48} color="#ccc" />
                        )}
                    </div>
                </div>
                <div className={styles.profileInfo}>
                    <h2 className={styles.name}>{user?.name || profileData.name}</h2>
                    <div className={styles.title}>
                        {user?.title || profileData.title}
                        {isAdmin && <span className={styles.adminBadge}>ADMIN</span>}
                    </div>
                </div>
            </div>

            <div className={styles.sectionHeader} style={{ marginTop: 2 }}>
                <span>{isAdmin ? 'ADMIN BLUEPRINT' : 'My Blueprint'}</span>
                <Settings size={14} className={styles.headerIcon} />
            </div>

            <div className={styles.bpToolbar}>
                <button className={styles.addBtn}>
                    <Plus size={14} />
                    <span>Add</span>
                </button>
                <div className={styles.searchBarWrapper}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search size={10} className={styles.searchIcon} />
                </div>
            </div>
            <div className={styles.blueprintContent}>
                <div className={styles.category}>
                    <div className={styles.categoryHeader} onClick={() => toggleExpand('graphs')}>
                        <div className={styles.categoryLabel}>
                            {expanded.graphs ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span className={styles.categoryTitle}>GRAPHS</span>
                        </div>
                        <Plus size={12} className={styles.categoryAdd} />
                    </div>
                    {expanded.graphs && (
                        <div className={styles.itemList}>
                            <div
                                className={`${styles.bpItem} ${activeBlueprintId === 'EventGraph' ? styles.active : ''}`}
                                onClick={() => setActiveBlueprintId('EventGraph')}
                            >
                                <div className={styles.bpIcon} style={{ color: '#ffffff' }}>🌐</div>
                                <span className={styles.bpName}>EventGraph (Career)</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* FUNCTIONS */}
                <div className={styles.category}>
                    <div className={styles.categoryHeader} onClick={() => toggleExpand('functions')}>
                        <div className={styles.categoryLabel}>
                            {expanded.functions ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span className={styles.categoryTitle}>FUNCTIONS (Career Projects)</span>
                        </div>
                        {isAdmin && <Plus size={12} className={styles.categoryAdd} onClick={handleAddCompany} />}
                    </div>
                    {expanded.functions && (
                        <div className={styles.itemList}>
                            {displayedCareer.map(node => (
                                <div
                                    key={node.id}
                                    className={`${styles.bpItem} ${activeBlueprintId === `graph-${node.id}` ? styles.active : ''}`}
                                    style={{ cursor: 'default' }}
                                >
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', flex: 1, cursor: 'pointer', height: '100%' }}
                                        onClick={() => setActiveBlueprintId(`graph-${node.id}`)}
                                    >
                                        <div className={styles.bpIcon} style={{ color: '#29c3ff', fontStyle: 'italic', fontFamily: 'serif' }}>f</div>
                                        <span className={styles.bpName}>{node.title.replace('Joined ', '').replace('Event ', '')}</span>
                                    </div>

                                    {isAdmin && (
                                        <button
                                            style={{
                                                marginLeft: 'auto',
                                                padding: 6,
                                                cursor: 'pointer',
                                                opacity: 0.8,
                                                position: 'relative',
                                                zIndex: 100,
                                                background: 'transparent',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            onClick={(e) => {
                                                console.log("[Sidebar] DELETE CLICKED:", node.id);
                                                e.stopPropagation();
                                                requestConfirmation({
                                                    title: "Delete Function Graph",
                                                    message: `Are you sure you want to delete '${node.title}'? This action cannot be undone.`,
                                                    isDanger: true,
                                                    onConfirm: () => {
                                                        deleteCareerNode(node.id);
                                                        addToast(`Deleted ${node.title}`, 'success');
                                                    }
                                                });
                                            }}
                                        >
                                            <Trash size={12} color="#ff4444" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {displayedCareer.length === 0 && <div className={styles.emptyHint}>No companies added</div>}
                        </div>
                    )}
                </div>

                {/* VARIABLES */}
                <div className={styles.category}>
                    <div className={styles.categoryHeader} onClick={() => toggleExpand('variables')}>
                        <div className={styles.categoryLabel}>
                            {expanded.variables ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            <span className={styles.categoryTitle}>VARIABLES (SKILLS)</span>
                        </div>
                        {isAdmin && <Plus size={12} className={styles.categoryAdd} onClick={(e) => { e.stopPropagation(); setIsAddingSkill(true); }} />}
                    </div>
                    {expanded.variables && (
                        <div className={styles.itemList}>
                            <div className={styles.bpItem}>
                                <div className={styles.bpIcon} style={{ borderRadius: '50%', width: 8, height: 8, margin: '0 3px', backgroundColor: '#ffd700' }}></div>
                                <span className={styles.bpName}>Skills Tree</span>
                            </div>
                            {skills.map((variable, index) => {
                                let color = '#aaa';
                                switch (variable.type) {
                                    case 'Boolean': color = '#8d0202'; break;
                                    case 'Integer': color = '#29c3ff'; break;
                                    case 'Integer64': color = '#96ef96'; break;
                                    case 'Float': color = '#3ecf3e'; break;
                                    case 'String': color = '#ff00ff'; break;
                                    case 'Vector': color = '#ffd700'; break;
                                    case 'Rotator': color = '#9999ff'; break;
                                    case 'Transform': color = '#ff6600'; break;
                                    case 'Object': color = '#00ccff'; break;
                                    default: color = '#aaa';
                                }
                                return (
                                    <div
                                        key={index}
                                        className={styles.bpItem}
                                        style={{ opacity: 0.8 }}
                                    >
                                        <div
                                            className={styles.bpIcon}
                                            style={{
                                                borderRadius: '3px',
                                                width: 10,
                                                height: 6,
                                                margin: '0 4px',
                                                backgroundColor: color,
                                                border: `1px solid ${color}`
                                            }}
                                            title={variable.type}
                                        />
                                        <span className={styles.bpName}>{variable.name}</span>
                                        <span style={{ fontSize: '9px', color: '#666', marginRight: '4px' }}>{variable.type}</span>
                                        {isAdmin && (
                                            <button
                                                style={{
                                                    marginLeft: 'auto',
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSkill(index);
                                                }}
                                            >
                                                <Trash size={10} color="#666" className={styles.headerIcon} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.footerSocials}>
                    {profileData.socials.map(social => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.socialIconLink}
                            title={social.name}
                        >
                            <span className={styles.socialName}>{social.name}</span>
                        </a>
                    ))}
                </div>
                <a
                    href={profileData.resumeUrl || resumeUrl}
                    className={styles.downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    // Only add download attribute if it's the local file (fallback)
                    download={!profileData.resumeUrl ? "Resume.pdf" : undefined}
                >
                    <Download size={14} style={{ marginRight: 6 }} />
                    Download Resume
                </a>
            </div>

            <InputModal
                isOpen={isAddingCompany}
                onClose={() => setIsAddingCompany(false)}
                onSubmit={onCompanySubmit}
                title="Create New Function Graph"
                placeholder="Enter Company / Function Name"
            />

            <CreateSkillModal
                isOpen={isAddingSkill}
                onClose={() => setIsAddingSkill(false)}
                onSubmit={addSkill}
            />
        </div>
    );
};
