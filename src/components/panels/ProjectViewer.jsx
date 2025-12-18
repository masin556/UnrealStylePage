import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ProjectViewer.module.css';
import { X } from 'lucide-react';

export const ProjectViewer = ({ project, onClose }) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (project) {
            // Dynamic import of markdown files
            // Note: In Vite, we can use import.meta.glob or raw loaders. 
            // For simplicity with the file structure we set up, we'll fetch or import.
            // Since we are checking for "easy to add", we assume files are at fixed paths matching IDs.

            const loadContent = async () => {
                try {
                    // Adjust path based on where we think the file is served from or bundled.
                    // For a dynamic solution in Vite without eager loading everything:
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

    if (!project) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={24} color="white" />
                </button>
                <div className={styles.content}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
