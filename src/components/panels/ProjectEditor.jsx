import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import YouTube from 'react-youtube';
import 'katex/dist/katex.min.css';
import styles from './ProjectEditor.module.css';
import { Save, Eye, Edit3, Youtube as YoutubeIcon, Sigma } from 'lucide-react';

export const ProjectEditor = ({ project, onSave, onCancel }) => {
    const [content, setContent] = useState(project.content || '');
    const [title, setTitle] = useState(project.title || '');
    const [mode, setMode] = useState('edit'); // 'edit' or 'preview'

    const handleSave = () => {
        // This will call saveProjectFile in context, which logs CRITICAL_SAVE_SIGNAL
        onSave({ ...project, title, content });
    };

    const renderers = {
        code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match && match[1] === 'youtube') {
                const videoId = String(children).trim();
                return <YouTube videoId={videoId} opts={{ width: '100%', height: '400' }} />;
            }
            return <code className={className} {...props}>{children}</code>;
        }
    };

    return (
        <div className={styles.editorContainer}>
            <div className={styles.toolbar}>
                <div className={styles.tabGroup}>
                    <button
                        className={`${styles.toolBtn} ${mode === 'edit' ? styles.active : ''}`}
                        onClick={() => setMode('edit')}
                    >
                        <Edit3 size={16} /> Edit
                    </button>
                    <button
                        className={`${styles.toolBtn} ${mode === 'preview' ? styles.active : ''}`}
                        onClick={() => setMode('preview')}
                    >
                        <Eye size={16} /> Preview
                    </button>
                </div>

                <div className={styles.actionGroup}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        <Save size={16} /> Save to Disk (.md)
                    </button>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>

            <div className={styles.contentArea}>
                {mode === 'edit' ? (
                    <div className={styles.editPane}>
                        <input
                            className={styles.titleInput}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Project Title"
                        />
                        <textarea
                            className={styles.textField}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your project content in Markdown... Use ```youtube\nVIDEO_ID\n``` for videos."
                        />
                    </div>
                ) : (
                    <div className={styles.previewPane}>
                        <h1 className={styles.previewTitle}>{title}</h1>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={renderers}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <span className={styles.hint}><YoutubeIcon size={12} /> Use <code>```youtube [ID] ```</code> for videos</span>
                <span className={styles.hint}><Sigma size={12} /> Use <code>$math$</code> for formulas</span>
            </div>
        </div>
    );
};
