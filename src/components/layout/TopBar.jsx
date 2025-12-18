import React from 'react';
import styles from './TopBar.module.css';
import { Play, Save, Settings, Menu } from 'lucide-react';
import { useSelection } from '../../context/SelectionContext';
import { useGoogleLogin } from '@react-oauth/google';

export const TopBar = () => {
    const { openProjectViewer, openContact, openSettings, toggleSidebar, theme, projects, user, login, logout } = useSelection();
    const [isFileMenuOpen, setIsFileMenuOpen] = React.useState(false);
    const [isEditMenuOpen, setIsEditMenuOpen] = React.useState(false);

    const logoSrc = theme === 'dark' ? '/Images/unrealLogoPurple.png' : '/unreal-engine.svg';

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log('Google Auth Success, fetching userinfo...');
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await res.json();
                console.log('Userinfo received:', userInfo.email);
                login({
                    name: userInfo.name,
                    email: userInfo.email,
                    profile_image: userInfo.picture,
                    title: "Authorized Admin"
                }, 'google');
                setIsEditMenuOpen(false);
            } catch (error) {
                console.error('Google Userinfo Fetch Error:', error);
            }
        },
        onError: () => console.error('Google Login Failed'),
    });

    const handleKakaoLogin = () => {
        if (!window.Kakao) {
            console.error('Kakao SDK not loaded');
            alert('Kakao SDK error. Please refresh.');
            return;
        }
        window.Kakao.Auth.login({
            scope: 'profile_nickname,account_email',
            success: (authObj) => {
                console.log('Kakao Auth Success, requesting user me...');
                window.Kakao.API.request({
                    url: '/v2/user/me',
                    success: (res) => {
                        const kakaoAccount = res.kakao_account;
                        console.log('Kakao Userinfo received:', kakaoAccount.email);
                        login({
                            name: res.properties.nickname,
                            email: kakaoAccount.email,
                            profile_image: res.properties.profile_image,
                            title: "Authorized Admin"
                        }, 'kakao');
                        setIsEditMenuOpen(false);
                    },
                    fail: (error) => {
                        console.error('Kakao Userinfo Fetch Error:', error);
                        setIsEditMenuOpen(false);
                    },
                });
            },
            fail: (error) => {
                console.error('Kakao Login Failed:', error);
                setIsEditMenuOpen(false);
            },
        });
    };

    const handleLogout = () => {
        logout();
        setIsEditMenuOpen(false);
    };

    return (
        <div className={styles.container}>
            <button className={styles.menuToggle} onClick={toggleSidebar}>
                <Menu size={20} />
            </button>
            <div className={styles.menuBar}>
                <div className={styles.logoSection}>
                    <img src={logoSrc} alt="Unreal Engine" className={styles.topLogo} width={24} height={24} />
                </div>
                <div
                    className={styles.menuItem}
                    onClick={() => {
                        setIsFileMenuOpen(!isFileMenuOpen);
                        setIsEditMenuOpen(false);
                    }}
                >
                    File
                    <div className={`${styles.dropdown} ${isFileMenuOpen ? styles.active : ''}`}>
                        <div className={styles.dropdownHeader}>Other Projects (Blueprint)</div>
                        {projects.filter(p => !p.tags?.includes('MAIN')).map(project => (
                            <div
                                key={project.id}
                                className={styles.dropdownItemText}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openProjectViewer(project);
                                    setIsFileMenuOpen(false);
                                }}
                            >
                                ● {project.title} : {project.date}
                            </div>
                        ))}
                    </div>
                </div>
                <div
                    className={styles.menuItem}
                    onClick={() => {
                        setIsEditMenuOpen(!isEditMenuOpen);
                        setIsFileMenuOpen(false);
                    }}
                >
                    Edit
                    <div className={`${styles.dropdown} ${isEditMenuOpen ? styles.active : ''}`}>
                        <div className={styles.dropdownHeader}>Authentication</div>
                        {!user ? (
                            <>
                                <div className={styles.dropdownItemText} onClick={() => { googleLogin(); setIsEditMenuOpen(false); }}>
                                    Log In with Google
                                </div>
                                <div className={styles.dropdownItemText} onClick={handleKakaoLogin}>
                                    Log In with KakaoTalk
                                </div>
                            </>
                        ) : (
                            <div className={styles.dropdownItemText} onClick={handleLogout} style={{ backgroundColor: 'var(--accent-blue)', color: 'white' }}>
                                Log Out ({user.name})
                            </div>
                        )}
                    </div>
                </div>
                <span className={styles.menuItem}>Window</span>
                <span className={styles.menuItem}>Help</span>
            </div>

            <div className={styles.spacer}></div>

            <div className={styles.toolbar}>
                <button
                    className={styles.iconBtn}
                    onClick={() => {
                        // Simulate Save
                        alert('Blueprint Layout Saved!');
                    }}
                    title="Save Layout"
                >
                    <Save size={16} />
                </button>
                <button className={styles.iconBtn} onClick={openSettings} title="Editor Settings">
                    <Settings size={16} />
                </button>

                <div className={styles.separator}></div>

                <button className={styles.playBtn} onClick={openContact}>
                    <Play size={16} fill="white" style={{ marginRight: 8 }} />
                    CONTACT ME
                </button>
            </div>
        </div>
    );
};
