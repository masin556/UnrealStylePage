import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSelection } from '../../context/SelectionContext';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import YouTube from 'react-youtube';
import styles from './ProjectWindow.module.css';
import 'katex/dist/katex.min.css';

export const ProjectWindow = ({ project }) => {
    const { isAdmin, setIsEditing } = useSelection();
    const [content, setContent] = useState('');

    useEffect(() => {
        if (project) {
            // Priority 1: Current unsaved content in memory (if any)
            if (project.content) {
                setContent(project.content);
                return;
            }

            const loadContent = async () => {
                try {
                    const modules = import.meta.glob('/src/content/projects/*.md', { query: '?raw', import: 'default' });
                    const path = `/src/content/projects/${project.id}.md`;

                    if (modules[path]) {
                        const md = await modules[path]();
                        setContent(md);
                    } else {
                        setContent('# Project Not Found\nNo markdown file found for this project ID.');
                    }
                } catch (err) {
                    setContent('# Error Loading Project');
                    console.error(err);
                }
            };
            loadContent();
        }
    }, [project]);

    const renderers = {
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'youtube') {
                const videoId = String(children).trim();
                return <YouTube videoId={videoId} opts={{ width: '100%', height: '400' }} />;
            }
            return <code className={className} {...props}>{children}</code>;
        },
        img: ({ node, ...props }) => {
            const fallbackSrc = '/Images/ActorImage.png';
            return (
                <img
                    {...props}
                    src={props.src || fallbackSrc}
                    onError={(e) => { e.target.onerror = null; e.target.src = fallbackSrc; }}
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        margin: '10px 0',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                />
            );
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <span className={styles.category}>{project.category}</span>
                    <span className={styles.separator}>/</span>
                    <span className={styles.title}>{project.title}</span>
                    <div className={styles.tagList}>
                        {project.tags?.map((tag, i) => (
                            <span key={i} className={styles.tagBadge}>#{tag}</span>
                        ))}
                    </div>
                </div>
                {isAdmin && (
                    <button
                        className={styles.editBtn}
                        onClick={() => {
                            // Sync the currently loaded content to the project in tabs/context before editing
                            project.content = content;
                            setIsEditing(true);
                        }}
                    >
                        Edit Content
                    </button>
                )}
            </div>
            <div className={styles.content}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={renderers}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};
