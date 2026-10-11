/**
 * js/skins/gemini/ui.js
 * Gemini: Modern Tactical Skin for Spaceward Ho!
 */

window.HOTHEME = window.HOTHEME || {};

HOTHEME.starLook = function(look, context) {
    if (!context) return look;
    const { p, s, k } = context;
    const base = look.base || '';

    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    const cx = 40, cy = 40;

    // Handle Fog of War & non-planet states securely (no info leak)
    if (base === 'unknown' || base === 'soon') {
        const radius = 8; // Scaled up slightly for map visibility
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = base === 'soon' ? '#38bdf8' : '#94a3b8'; 
        ctx.fill();
        
        if (base === 'unknown') {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e2e8f0'; 
            ctx.stroke();
        }

        if (base === 'soon') {
            ctx.beginPath();
            ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
        }
        return Object.assign({}, look, { pic: canvas });
    }

    if (base === 'battle') {
        // Red starburst for battle
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const r = i % 2 === 0 ? 18 : 8; // Scaled up
            if (i === 0) ctx.moveTo(cx + r, cy);
            else ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        return Object.assign({}, look, { pic: canvas });
    }
    
    if (base.startsWith('nova')) {
        // Expanding purple ring for novae
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 4;
        ctx.stroke();
        return Object.assign({}, look, { pic: canvas });
    }

    if (!base.startsWith('planet') && !base.startsWith('mined')) {
        return look; // Unknown base types fallback to classic handling
    }

    // It's a planet. Use known info 'k' if available, otherwise absolute truth 's'.
    const data = k || s || {};
    
    // 1. Gravity class (parsed from base string) - SCALED UP
    const isMined = base.startsWith('mined');
    const rowStr = isMined ? base.replace('mined', '') : base.replace('planet', '');
    const gravRow = parseInt(rowStr, 10);
    const validGrav = isNaN(gravRow) ? 2 : gravRow;
    const radius = 20 + (validGrav * 3); // Fills much more of the 80x80 canvas

    // Base planet
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // 2. Heat and Ice Caps
    const prefTemp = (p && p.homeT !== undefined) ? p.homeT : 72;
    const trueTemp = data.t !== undefined ? data.t : 72;
    const relTemp = trueTemp - prefTemp + 72;

    if (relTemp > 77) {
        const heatStr = Math.min((relTemp - 77) / 20, 1);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + 0.6 * heatStr})`;
        ctx.lineWidth = 2 + (3 * heatStr);
        ctx.stroke();
        ctx.shadowBlur = 0;
    } else if (relTemp < 65) {
        ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
        ctx.beginPath();
        ctx.arc(cx, cy - radius * 0.65, radius * 0.35, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy + radius * 0.65, radius * 0.35, Math.PI, Math.PI * 2);
        ctx.fill();
    }

    // 3. Metal Remaining
    const metal = data.metal || 0;
    if (isMined) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - radius * 0.7, cy - radius * 0.7);
        ctx.lineTo(cx + radius * 0.7, cy + radius * 0.7);
        ctx.moveTo(cx + radius * 0.7, cy - radius * 0.7);
        ctx.lineTo(cx - radius * 0.7, cy + radius * 0.7);
        ctx.stroke();
    } else {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        if (metal >= 1000)  { ctx.beginPath(); ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2); ctx.stroke(); }
        if (metal >= 2500)  { ctx.beginPath(); ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2); ctx.stroke(); }
        if (metal >= 5000)  { ctx.beginPath(); ctx.arc(cx, cy, radius * 0.7, 0, Math.PI * 2); ctx.stroke(); }
        if (metal >= 10000) { ctx.beginPath(); ctx.arc(cx, cy, radius * 0.9, 0, Math.PI * 2); ctx.stroke(); }
    }

    // 4. Owners & Hats (Adjusted to new radius)
    const hat = look.hat;
    if (hat) {
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 6, -Math.PI * 0.8, -Math.PI * 0.2);
        
        if (hat.startsWith('white')) {
            const match = hat.match(/white(\d)/);
            const prof = match ? parseInt(match[1], 10) : 0;
            const profColors = ['#ffffff', '#4ade80', '#facc15', '#f87171'];
            ctx.strokeStyle = profColors[prof] || '#ffffff';
            ctx.stroke();
            
            // Diamond marker
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.moveTo(cx, cy - radius - 14);
            ctx.lineTo(cx + 5, cy - radius - 9);
            ctx.lineTo(cx, cy - radius - 4);
            ctx.lineTo(cx - 5, cy - radius - 9);
            ctx.fill();
        } 
        else if (hat.startsWith('bad')) {
            const match = hat.match(/bad(\d+)/);
            const faceIdx = match ? parseInt(match[1], 10) : 0;
            const ENEMY_COLORS = [
                '#ff0055', '#00ff99', '#00aaff', '#ffaa00',
                '#cc00ff', '#ffff00', '#ff0000', '#00ffff',
                '#88ff00', '#ff5588', '#5555ff', '#ff8800',
                '#ff00aa', '#00ff00', '#0055ff', '#ffaaaa'
            ];
            ctx.strokeStyle = ENEMY_COLORS[faceIdx % 16];
            ctx.stroke();

            // Triangle marker
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.moveTo(cx, cy - radius - 14);
            ctx.lineTo(cx + 6, cy - radius - 4);
            ctx.lineTo(cx - 6, cy - radius - 4);
            ctx.fill();
        }
    }

    const newLook = Object.assign({}, look, { pic: canvas });
    delete newLook.hat; 
    return newLook;
};


HOTHEME.shipPic = function(design, IMG, rusty, palmFix) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const cx = 32, cy = 32;

    ctx.translate(cx, cy);

    const strokeColor = rusty ? '#9ca3af' : '#38bdf8'; 
    const glowColor = rusty ? 'transparent' : '#0284c7';

    if (!rusty) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = glowColor;
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    const rangeVal = design.R || 0;
    const speedVal = design.V || 0;
    const weaponVal = design.W || 0;
    const shieldVal = design.S || 0;
    const type = design.type || 'scout';
    const isColony = (type === 'colony');

    const wingSpan = 8 + (rangeVal * 1.5);
    const engineLen = 10 + (speedVal * 2);

    if (shieldVal > 0) {
        ctx.beginPath();
        ctx.arc(0, 0, 16 + (shieldVal * 2), 0, Math.PI * 2);
        ctx.strokeStyle = rusty ? '#6b7280' : '#818cf8';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = strokeColor; 
    }

    ctx.beginPath();
    
    // Explicit shape definitions by type
    if (isColony) {
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const r = 14;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
    } else if (type === 'satellite') {
        ctx.moveTo(0, -15);
        ctx.lineTo(15, 0);
        ctx.lineTo(0, 15);
        ctx.lineTo(-15, 0);
        ctx.closePath();
    } else if (type === 'tanker') {
        ctx.ellipse(0, 0, 12, 18, 0, 0, Math.PI * 2);
    } else if (type === 'bio') {
        ctx.moveTo(0, -16);
        ctx.quadraticCurveTo(12, -8, 12, 8);
        ctx.quadraticCurveTo(0, 16, -12, 8);
        ctx.quadraticCurveTo(-12, -8, 0, -16);
    } else if (type === 'decoy') {
        for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const r = i % 2 === 0 ? 14 : 6;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
    } else if (type === 'dread') {
        // Massive Heavy Hull
        ctx.moveTo(0, -22);
        ctx.lineTo(wingSpan + 4, 4);
        ctx.lineTo(wingSpan, engineLen);
        ctx.lineTo(-wingSpan, engineLen);
        ctx.lineTo(-wingSpan - 4, 4);
        ctx.closePath();
    } else if (type === 'fighter') {
        // Aggressive swept forward
        ctx.moveTo(0, -18);
        ctx.lineTo(wingSpan, 12);
        ctx.lineTo(0, 5);
        ctx.lineTo(-wingSpan, 12);
        ctx.closePath();
    } else {
        // Default Scout: Fast dart
        ctx.moveTo(0, -14);
        ctx.lineTo(wingSpan * 0.8, 6);
        ctx.lineTo(0, engineLen * 0.8);
        ctx.lineTo(-wingSpan * 0.8, 6);
        ctx.closePath();
    }
    
    ctx.fillStyle = rusty ? 'rgba(75, 85, 99, 0.4)' : 'rgba(15, 23, 42, 0.8)';
    ctx.fill();
    ctx.stroke();

    // Engine Burn
    if (!rusty && speedVal > 0 && type !== 'satellite' && type !== 'bio' && type !== 'decoy') {
        ctx.beginPath();
        const thrustWidth = type === 'dread' ? wingSpan * 0.6 : wingSpan * 0.4;
        ctx.moveTo(-thrustWidth, engineLen * 0.8);
        ctx.lineTo(0, engineLen + (type === 'dread' ? 10 : 6));
        ctx.lineTo(thrustWidth, engineLen * 0.8);
        ctx.fillStyle = '#f97316'; 
        ctx.shadowColor = '#ea580c';
        ctx.fill();
        ctx.shadowColor = glowColor; 
    }

    // Weapons Mounts
    if (weaponVal > 0 && type !== 'bio' && type !== 'decoy') {
        ctx.beginPath();
        const wOffset = (type === 'dread') ? wingSpan * 0.8 : wingSpan * 0.6;
        ctx.moveTo(-wOffset, 5);
        ctx.lineTo(-wOffset, -8 - (weaponVal * 1.5));
        ctx.moveTo(wOffset, 5);
        ctx.lineTo(wOffset, -8 - (weaponVal * 1.5));
        
        // Dreadnoughts get a heavy center spinal cannon
        if (type === 'dread') {
            ctx.moveTo(0, -22);
            ctx.lineTo(0, -26 - weaponVal);
        }
        
        ctx.strokeStyle = rusty ? '#b91c1c' : '#fbbf24';
        ctx.lineWidth = type === 'dread' ? 3 : 2;
        ctx.stroke();
    }

    if (rusty) {
        ctx.beginPath();
        ctx.moveTo(-15, -15);
        ctx.lineTo(15, 15);
        ctx.moveTo(15, -15);
        ctx.lineTo(-15, 15);
        ctx.strokeStyle = '#ef4444'; 
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    ctx.translate(-cx, -cy);
    return canvas;
};

if (!window.HOSKINS_INLINE) {
    document.write('<script src="js/skins/classic/ui.js"><\/script>');
}