import React, { useEffect, useRef, useState } from 'react';
import { useSelection } from '../../context/SelectionContext';
import { ADMIN_CONFIG } from '../../config/admin';

export const CopyrightProtector = () => {
    const { isAdmin } = useSelection();
    const protectorRef = useRef(null);
    const [renderCount, setRenderCount] = useState(0);

    const lastCheck = useRef(0);

    const checkAndRestore = () => {
        const now = Date.now();
        if (now - lastCheck.current < 500) return; // Debounce checks
        lastCheck.current = now;

        // isAdmin is handled via context at component scope
        if (isAdmin) return;

        const existing = document.getElementById('copyright-protector-root');

        if (!existing) {
            setRenderCount(prev => prev + 1);
            return;
        }

        // Check if content is correct
        if (!existing.innerText.includes('@DEV_PPATABOX') || !existing.innerText.includes('GIBEON Softworks')) {
            setRenderCount(prev => prev + 1);
            return;
        }

        // Check styles
        const style = window.getComputedStyle(existing);
        if (
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            parseFloat(style.opacity) < 0.1
        ) {
            existing.style.setProperty('display', 'block', 'important');
            existing.style.setProperty('visibility', 'visible', 'important');
            existing.style.setProperty('opacity', '1', 'important');
            existing.style.setProperty('pointer-events', 'auto', 'important');
        }
    };

    useEffect(() => {
        if (isAdmin) return;

        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            for (const mutation of mutations) {
                // If it's a childList change on body or if it's our own element being changed
                if (mutation.type === 'childList') {
                    const removed = Array.from(mutation.removedNodes).some(node => node.id === 'copyright-protector-root');
                    if (removed) {
                        shouldCheck = true;
                        break;
                    }
                }
                if (mutation.type === 'attributes' && mutation.target.id === 'copyright-protector-root') {
                    shouldCheck = true;
                    break;
                }
            }
            if (shouldCheck) checkAndRestore();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'hidden']
        });

        const interval = setInterval(checkAndRestore, 2000);

        return () => {
            observer.disconnect();
            clearInterval(interval);
        };
    }, []);

    if (isAdmin) return null;

    const styles = {
        position: 'fixed',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#888',
        padding: '4px 12px',
        borderRadius: '4px',
        fontSize: '11px',
        zIndex: 99999,
        pointerEvents: 'auto',
        userSelect: 'none',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        display: 'block',
        visibility: 'visible',
        opacity: 1,
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap'
    };

    return (
        <div
            id="copyright-protector-root"
            style={styles}
            key={renderCount}
        >
            © 2025 <span style={{ color: '#aaa', fontWeight: 'bold' }}>GIBEON Softworks</span> | All Rights Reserved by <span style={{ color: '#0078d4' }}>@DEV_PPATABOX</span>
        </div>
    );
};
