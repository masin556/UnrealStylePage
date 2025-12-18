import React from 'react';
import styles from './Graph.module.css';

export const GraphConnection = ({ start, end, isLive, isDebug, isData, isProject }) => {
    const startX = start.x;
    const startY = start.y;
    const endX = end.x;
    const endY = end.y;

    const dist = Math.abs(endX - startX);
    // Use a larger offset for smoother, more natural curves
    const offset = Math.max(dist * 0.5, 80); // Minimum 80px offset for short connections
    const control1X = startX + offset;
    const control1Y = startY;
    const control2X = endX - offset;
    const control2Y = endY;

    const pathData = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;

    // Determine wire color: 
    // Data -> Green
    // Project -> Red (User Request)
    // Standard Exec -> White (User Request)
    const baseColor = isData ? "#4caf50" : (isProject ? "#ff0000" : "#ffffff");
    const activeColor = isData ? "#81c784" : "#ffffff";

    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible', zIndex: (isLive || isDebug) ? 10 : 0 }}>
            {/* Glow Path */}
            {(isLive || isDebug) && (
                <path
                    d={pathData}
                    stroke={isDebug ? "#ffd700" : activeColor}
                    strokeWidth="4"
                    fill="none"
                    strokeOpacity="0.2"
                    style={{ filter: 'blur(4px)' }}
                />
            )}
            {/* Main Path */}
            <path
                d={pathData}
                stroke={isLive ? activeColor : isDebug ? "#ffd700" : baseColor}
                strokeWidth={isLive || isDebug ? "2.5" : "2"}
                fill="none"
                strokeOpacity={isLive || isDebug ? "1" : isData ? "0.6" : "0.4"}
                strokeDasharray={isDebug || (isLive && isData) ? "8, 8" : "none"}
                className={isLive ? styles.livePath : ''}
            />
            {/* Traveling Signal Dot */}
            {isLive && (
                <circle r="3" fill={activeColor} style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }}>
                    <animateMotion
                        path={pathData}
                        dur={isData ? "2s" : "1.2s"}
                        repeatCount="indefinite"
                    />
                </circle>
            )}
        </svg>
    );
};
