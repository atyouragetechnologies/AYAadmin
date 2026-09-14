import { useEffect, useRef } from 'react';

// --- Neon Rain Layer ---
const NeonRainLayer = ({ isActive = true }: { isActive?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let isVisible = true;
        let drops: any[] = [];
        let frames = 0;
        let frameCount = 0;
        let lastFpsTime = performance.now();

        const initDrops = () => {
            const isMobile = window.innerWidth <= 768;
            const count = isMobile ? 80 : 90;
            drops = [];
            for (let i = 0; i < count; i++) {
                const isClose = Math.random() < (isMobile ? 0.2 : 0.1);
                const rColor = Math.random();
                let baseColorStr = '0, 240, 255';
                if (rColor > 0.5 && rColor <= 0.8) baseColorStr = '180, 0, 255';
                else if (rColor > 0.8) baseColorStr = '255, 0, 180';

                drops.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    length: isClose ? 80 + Math.random() * 40 : 40 + Math.random() * 50,
                    speed: isMobile ? 3 + Math.random() * 5 : 2 + Math.random() * 3,
                    opacity: isClose ? 0.7 : 0.15 + Math.random() * 0.5,
                    baseColorStr,
                    width: isClose ? 3 + Math.random() : 1.5 + Math.random() * 1.5,
                    isClose
                });
            }
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDrops();
        };

        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            if (!isVisible || !isActive) {
                // If not active, just wait
                animationFrameId = requestAnimationFrame(render);
                return;
            }
            

            frameCount++;
            // Throttle rendering to 30fps for map ambience on desktop and mobile
            if (frameCount % 2 !== 0) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            
            drops.forEach(drop => {
                // Parallax depth based on opacity
                const currentSpeed = drop.speed + (drop.speed * drop.opacity * 2);
                drop.y += currentSpeed;
                
                if (drop.y > canvas.height + drop.length) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                    const rColor = Math.random();
                    let baseColorStr = '0, 240, 255';
                    if (rColor > 0.5 && rColor <= 0.8) baseColorStr = '180, 0, 255';
                    else if (rColor > 0.8) baseColorStr = '255, 0, 180';
                    drop.baseColorStr = baseColorStr;
                }

                ctx.beginPath();
                const grad = ctx.createLinearGradient(drop.x, drop.y - drop.length, drop.x, drop.y);
                grad.addColorStop(0, `rgba(${drop.baseColorStr}, 0)`);
                grad.addColorStop(1, `rgba(${drop.baseColorStr}, ${drop.opacity})`);
                
                ctx.strokeStyle = grad;
                ctx.lineWidth = drop.width;
                ctx.shadowBlur = 0;
                ctx.shadowColor = `rgba(${drop.baseColorStr}, ${drop.opacity})`;
                ctx.moveTo(drop.x, drop.y - drop.length);
                ctx.lineTo(drop.x, drop.y);
                ctx.stroke();
                ctx.shadowBlur = 0;
            });
            ctx.restore();

            if (import.meta.env.DEV) {
                frames++;
                const now = performance.now();
                if (now - lastFpsTime >= 5000) {
                    console.log(`[NeonRain FPS] ${(frames / ((now - lastFpsTime) / 1000)).toFixed(1)}`);
                    frames = 0;
                    lastFpsTime = now;
                }
            }

            animationFrameId = requestAnimationFrame(render);
        };
        
        render();

        const handleVisibility = () => {
            if (document.hidden) {
                isVisible = false;
                cancelAnimationFrame(animationFrameId);
            } else {
                isVisible = true;
                render();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', handleVisibility);
            cancelAnimationFrame(animationFrameId);
            drops = [];
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// --- Shooting Stars Layer ---
const ShootingStarsLayer = ({ isActive = true }: { isActive?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let isVisible = true;
        let stars: any[] = [];
        let nextStarTime = 0;
        const maxStars = 5;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = [];
            nextStarTime = Date.now() + 1000 + Math.random() * 2000;
        };

        window.addEventListener('resize', resize);
        resize();

        const spawnStar = (isSecondary = false) => {
            const isMobile = window.innerWidth <= 768;
            const isMega = !isSecondary && Math.random() < 0.05;
            const isWhite = Math.random() < 0.4;
            const baseColor = isMega ? '255, 215, 0' : (isWhite ? '255, 255, 255' : '255, 215, 0');
            const vx = isMega ? (18 + Math.random() * 4) : (isMobile ? 6 + Math.random() * 4 : 8 + Math.random() * 6);
            
            stars.push({
                x: -200 - (isSecondary ? Math.random() * 100 : 0),
                y: Math.random() * (canvas.height * 0.6),
                vx: vx,
                vy: vx * 0.3,
                length: isMega ? 400 : 150 + Math.random() * 150,
                opacity: 0,
                active: true,
                phase: 'fadein',
                baseColor: baseColor,
                isMega: isMega
            });
        };

        const render = () => {
            if (!isVisible || !isActive) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }
            const now = Date.now();

            if (now > nextStarTime && stars.length < maxStars) {
                spawnStar();
                if (Math.random() < 0.3) spawnStar(true);
                nextStarTime = now + 2000 + Math.random() * 2000;
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            
            const maxOpacity = 1.0;
            
            for (let i = stars.length - 1; i >= 0; i--) {
                const star = stars[i];
                if (!star.active) {
                    stars.splice(i, 1);
                    continue;
                }

                if (star.phase === 'fadein') {
                    star.opacity += (maxOpacity / 12);
                    if (star.opacity >= maxOpacity) {
                        star.opacity = maxOpacity;
                        star.phase = 'travel';
                    }
                } else if (star.phase === 'fadeout') {
                    star.opacity -= (maxOpacity / 12);
                    if (star.opacity <= 0) {
                        star.active = false;
                    }
                }

                star.x += star.vx;
                star.y += star.vy;

                if (star.phase !== 'fadeout' && (star.x > canvas.width + star.length || star.y > canvas.height + star.length)) {
                    star.phase = 'fadeout';
                }

                const tailX = star.x - (star.vx * (star.length / 10));
                const tailY = star.y - (star.vy * (star.length / 10));
                
                const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
                grad.addColorStop(0, `rgba(${star.baseColor}, 0)`);
                grad.addColorStop(1, `rgba(${star.baseColor}, ${star.opacity})`);

                // Tail using triangle for taper
                const dx = star.vx;
                const dy = star.vy;
                const mag = Math.sqrt(dx*dx + dy*dy);
                const nx = -dy / mag;
                const ny = dx / mag;
                const halfW = 2; // 4px head width tapers to 0
                
                ctx.beginPath();
                ctx.moveTo(star.x + nx * halfW, star.y + ny * halfW);
                ctx.lineTo(tailX, tailY);
                ctx.lineTo(star.x - nx * halfW, star.y - ny * halfW);
                ctx.closePath();
                ctx.fillStyle = grad;
                ctx.fill();

                // Glow head
                ctx.beginPath();
                ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.shadowBlur = 0;
                ctx.shadowColor = `rgba(${star.baseColor}, ${star.opacity})`;
                ctx.fill();

                // Outer ring
                ctx.beginPath();
                ctx.arc(star.x, star.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${star.baseColor}, ${star.opacity * 0.3})`;
                ctx.fill();
                
                // If mega star, draw an extra trail component
                if (star.isMega) {
                    ctx.beginPath();
                    ctx.moveTo(star.x, star.y);
                    ctx.lineTo(tailX - dx*10, tailY - dy*10);
                    ctx.strokeStyle = `rgba(${star.baseColor}, ${star.opacity * 0.5})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                
                ctx.shadowBlur = 0;
            }

            ctx.restore();
            animationFrameId = requestAnimationFrame(render);
        };
        
        render();

        const handleVisibility = () => {
            if (document.hidden) {
                isVisible = false;
                cancelAnimationFrame(animationFrameId);
            } else {
                isVisible = true;
                nextStarTime = Date.now() + 1000;
                render();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', handleVisibility);
            cancelAnimationFrame(animationFrameId);
            stars = [];
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

// --- Constellation Lines Layer ---
const ConstellationLayer = ({ scrollY, isActive = true }: { scrollY: any, isActive?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let isVisible = true;
        let stars: any[] = [];
        let lines: any[] = [];

        const initMap = () => {
            const isMobile = window.innerWidth <= 768;
            const starCount = isMobile ? 35 : 60;
            
            stars = [];
            lines = [];

            // Place stars in a wide vertical space to account for scroll parallax
            for (let i = 0; i < starCount; i++) {
                let x = Math.random() * canvas.width;
                const isAnchor = Math.random() < 0.1;

                stars.push({
                    id: i,
                    x: x,
                    y: -1000 + Math.random() * (canvas.height + 3000), // Spanned for scroll space
                    radius: isAnchor ? 5 + Math.random() * 2 : 2 + Math.random() * 3,
                    opacity: isAnchor ? 0.9 + Math.random() * 0.1 : 0.4 + Math.random() * 0.6,
                    targetOpacity: isAnchor ? 0.9 + Math.random() * 0.1 : 0.4 + Math.random() * 0.6,
                    pulseSpeed: 0.002 + Math.random() * 0.003,
                    color: Math.random() > 0.3 ? '0, 242, 255' : '255, 255, 255',
                    depth: 0.3 + Math.random() * 0.7,
                    isAnchor: isAnchor
                });
            }

            for (let i = 0; i < stars.length; i++) {
                let connections = 0;
                for (let j = i + 1; j < stars.length; j++) {
                    if (connections >= 3) break;
                    const dx = stars[i].x - stars[j].x;
                    const dy = stars[i].y - stars[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < 220) {
                        lines.push({
                            starA: i,
                            starB: j,
                            opacity: 0,
                            targetOpacity: 0.15 + Math.random() * 0.20, // max 0.35
                            phase: Math.random() > 0.25 ? 'visible' : 'hidden',
                            timer: Date.now() + Math.random() * 5000
                        });
                        connections++;
                    }
                }
            }
            
            lines.forEach(line => {
                if (line.phase === 'visible') line.opacity = line.targetOpacity;
            });
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initMap();
        };

        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            if (!isVisible || !isActive) {
                animationFrameId = requestAnimationFrame(render);
                return;
            }
            const now = Date.now();
            const currentScrollY = scrollY ? scrollY.get() : 0;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            lines.forEach(line => {
                if (now > line.timer) {
                    if (line.phase === 'visible') {
                        line.phase = 'fadeout';
                        line.timer = now + 2000;
                    } else if (line.phase === 'hidden') {
                        line.phase = 'fadein';
                        line.timer = now + 2000;
                    } else if (line.phase === 'fadein') {
                        line.phase = 'visible';
                        line.timer = now + 3000 + Math.random() * 3000;
                    } else if (line.phase === 'fadeout') {
                        line.phase = 'hidden';
                        line.timer = now + 3000 + Math.random() * 3000;
                    }
                }

                if (line.phase === 'fadein') {
                    line.opacity += (line.targetOpacity / 120);
                    if (line.opacity > line.targetOpacity) line.opacity = line.targetOpacity;
                } else if (line.phase === 'fadeout') {
                    line.opacity -= (line.targetOpacity / 120);
                    if (line.opacity < 0) line.opacity = 0;
                }

                if (line.opacity > 0) {
                    const sa = stars[line.starA];
                    const sb = stars[line.starB];
                    
                    const ya = sa.y - (currentScrollY * sa.depth * 0.1);
                    const yb = sb.y - (currentScrollY * sb.depth * 0.1);
                    
                    if (ya < -50 || ya > canvas.height + 50 || yb < -50 || yb > canvas.height + 50) return;

                    ctx.beginPath();
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = `rgba(0, 242, 255, 0.5)`;
                    ctx.moveTo(sa.x, ya);
                    ctx.lineTo(sb.x, yb);
                    ctx.strokeStyle = `rgba(0, 242, 255, ${line.opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            });

            stars.forEach(star => {
                if (!star.isAnchor) {
                    if (Math.abs(star.opacity - star.targetOpacity) < star.pulseSpeed) {
                        star.targetOpacity = 0.4 + Math.random() * 0.6;
                    } else if (star.opacity < star.targetOpacity) {
                        star.opacity += star.pulseSpeed;
                    } else {
                        star.opacity -= star.pulseSpeed;
                    }
                }

                const sy = star.y - (currentScrollY * star.depth * 0.1);

                if (sy > -50 && sy < canvas.height + 50) {
                    ctx.beginPath();
                    ctx.shadowBlur = 0;
                    ctx.shadowColor = `rgba(${star.color}, ${star.opacity})`;
                    ctx.fillStyle = `rgba(${star.color}, ${star.opacity})`;
                    ctx.arc(star.x, sy, star.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            ctx.restore();
            animationFrameId = requestAnimationFrame(render);
        };
        
        render();

        const handleVisibility = () => {
            if (document.hidden) {
                isVisible = false;
                cancelAnimationFrame(animationFrameId);
            } else {
                isVisible = true;
                render();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', handleVisibility);
            cancelAnimationFrame(animationFrameId);
            stars = [];
            lines = [];
        };
    }, [scrollY]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export const MapAmbience = ({ scrollY, isActive = true }: { scrollY: any, isActive?: boolean }) => {
    return (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-[15]">
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 20, 0.25)',
                pointerEvents: 'none'
            }} />
            <ConstellationLayer scrollY={scrollY} isActive={isActive} />
            <NeonRainLayer isActive={isActive} />
            <ShootingStarsLayer isActive={isActive} />
        </div>
    );
};
