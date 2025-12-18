import React from 'react';
import styles from './ContactModal.module.css';
import { X, Mail, Phone, MapPin, Globe } from 'lucide-react';
import { profileData } from '../../data/profile';

export const ContactModal = ({ onClose }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.card}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} color="#555" />
                </button>

                <div className={styles.header}>
                    <div className={styles.logo}>
                        {profileData.headerLogo ? (
                            <img src={profileData.headerLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                            profileData.headerText || "UE"
                        )}
                    </div>
                    <div className={styles.headerText}>GAME DEVELOPER</div>
                </div>

                <div className={styles.body}>
                    <div className={styles.avatar}>
                        {profileData.image && !profileData.image.includes('placeholder') ? (
                            <img src={profileData.image} alt="Profile" className={styles.avatarImg} />
                        ) : (
                            profileData.name.charAt(0)
                        )}
                    </div>

                    <div className={styles.info}>
                        <h2 className={styles.name}>{profileData.name}</h2>
                        <div className={styles.title}>{profileData.title}</div>
                        <div className={styles.divider} />

                        <div className={styles.row}>
                            <Mail size={16} className={styles.icon} />
                            <a href={profileData.socials.find(s => s.name === 'Email').url}>
                                {profileData.socials.find(s => s.name === 'Email').url.replace('mailto:', '')}
                            </a>
                        </div>

                        <div className={styles.row}>
                            <Globe size={16} className={styles.icon} />
                            <span>https://github.com/Seawo</span>
                        </div>

                        <div className={styles.row}>
                            <MapPin size={16} className={styles.icon} />
                            <span>Republic of Korea</span>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    AVAILABLE FOR HIRE
                </div>
            </div>
        </div>
    );
};
