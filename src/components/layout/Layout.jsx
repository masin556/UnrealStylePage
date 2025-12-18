import React from 'react';
import styles from './Layout.module.css';
import { TabBrowser } from './TabBrowser';
import { useSelection } from '../../context/SelectionContext';

export const Layout = ({ topBar, sidebar, main, details, bottom }) => {
    const { isSidebarOpen } = useSelection();

    return (
        <div className={styles.container}>
            <header className={styles.header}>{topBar}</header>
            <div className={styles.body}>
                <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.active : ''}`}>{sidebar}</aside>
                <main className={styles.main}>
                    <TabBrowser />
                    <div className={styles.workArea}>
                        <div className={styles.graphArea}>{main}</div>
                        <aside className={styles.details}>{details}</aside>
                    </div>
                    <footer className={styles.contentBrowser}>{bottom}</footer>
                </main>
            </div>
        </div>
    );
};
