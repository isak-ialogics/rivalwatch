import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const COMPETITORS = ['Stripe', 'Notion', 'Linear', 'Figma', 'Vercel'];

const FEED_ITEMS = [
    { company: 'stripe.com', change: 'Pricing page updated', time: '2m ago', color: '#00e5ff' },
    { company: 'notion.so', change: 'New feature launched', time: '8m ago', color: '#6ee7b7' },
    { company: 'linear.app', change: 'Blog post published', time: '15m ago', color: '#f59e0b' },
    { company: 'figma.com', change: 'Job listings changed', time: '1h ago', color: '#a78bfa' },
    { company: 'vercel.com', change: 'Docs restructured', time: '2h ago', color: '#00e5ff' },
    { company: 'stripe.com', change: 'Careers page updated', time: '3h ago', color: '#6ee7b7' },
    { company: 'notion.so', change: 'Pricing tweaked', time: '5h ago', color: '#f59e0b' },
    // Duplicated for seamless infinite scroll
    { company: 'stripe.com', change: 'Pricing page updated', time: '2m ago', color: '#00e5ff' },
    { company: 'notion.so', change: 'New feature launched', time: '8m ago', color: '#6ee7b7' },
    { company: 'linear.app', change: 'Blog post published', time: '15m ago', color: '#f59e0b' },
    { company: 'figma.com', change: 'Job listings changed', time: '1h ago', color: '#a78bfa' },
    { company: 'vercel.com', change: 'Docs restructured', time: '2h ago', color: '#00e5ff' },
    { company: 'stripe.com', change: 'Careers page updated', time: '3h ago', color: '#6ee7b7' },
    { company: 'notion.so', change: 'Pricing tweaked', time: '5h ago', color: '#f59e0b' },
];

export default function Welcome({ auth, canLogin, canRegister }) {
    const [activeCompetitor, setActiveCompetitor] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setActiveCompetitor(prev => (prev + 1) % COMPETITORS.length);
        }, 2000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <Head title="RivalWatch — Know Every Move Your Competitors Make" />

            {/* ─── Fonts + Custom keyframes ─── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

                *, *::before, *::after { box-sizing: border-box; }
                body { margin: 0; background: #030912; font-family: 'Outfit', sans-serif; }
                .f-display { font-family: 'Syne', sans-serif; }

                @keyframes radar-sweep {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes ping-out {
                    0%   { transform: scale(1); opacity: 0.7; }
                    100% { transform: scale(2.6); opacity: 0; }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes feed-scroll {
                    0%   { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                @keyframes glow-pulse {
                    0%, 100% { box-shadow: 0 0 18px rgba(0,229,255,0.25); }
                    50%       { box-shadow: 0 0 40px rgba(0,229,255,0.55), 0 0 70px rgba(0,229,255,0.18); }
                }
                @keyframes cursor-blink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0; }
                }
                @keyframes float-y {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(-10px); }
                }
                @keyframes dot-blink {
                    0%, 100% { opacity: 1; }
                    50%       { opacity: 0.2; }
                }

                .radar-arm   { animation: radar-sweep 3.5s linear infinite; transform-origin: 200px 200px; }
                .ping-ring   { animation: ping-out 2.2s ease-out infinite; }
                .float-anim  { animation: float-y 5s ease-in-out infinite; }
                .feed-anim   { animation: feed-scroll 22s linear infinite; }
                .glow-btn    { animation: glow-pulse 3s ease-in-out infinite; }
                .dot-live    { animation: dot-blink 1.4s step-end infinite; }
                .name-in     { animation: slide-up 0.35s ease forwards; }

                .grid-bg {
                    background-image:
                        linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px);
                    background-size: 48px 48px;
                }
                .glass-card {
                    background: rgba(255,255,255,0.025);
                    border: 1px solid rgba(255,255,255,0.07);
                    backdrop-filter: blur(10px);
                }
                .glass-card-cyan {
                    background: rgba(0,229,255,0.04);
                    border: 1px solid rgba(0,229,255,0.22);
                }
                .section-label {
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #00e5ff;
                }
                .accent-glow-text {
                    color: #00e5ff;
                    text-shadow: 0 0 48px rgba(0,229,255,0.45);
                }
                .check-cyan { color: #00e5ff; }
                .check-emerald { color: #6ee7b7; }
                .check-purple { color: #a78bfa; }
            `}</style>

            <div style={{ background: 'linear-gradient(145deg, #030912 0%, #061020 60%, #030912 100%)', minHeight: '100vh' }}>

                {/* ══════════════════════════════
                    NAV
                ══════════════════════════════ */}
                <nav style={{ position: 'relative', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', maxWidth: '1280px', margin: '0 auto' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="15" stroke="rgba(0,229,255,0.25)" strokeWidth="1"/>
                            <circle cx="16" cy="16" r="10" stroke="rgba(0,229,255,0.35)" strokeWidth="1"/>
                            <circle cx="16" cy="16" r="5"  stroke="rgba(0,229,255,0.45)" strokeWidth="1"/>
                            <circle cx="16" cy="16" r="2"  fill="#00e5ff"/>
                            <line x1="16" y1="16" x2="16" y2="1.5" stroke="rgba(0,229,255,0.85)" strokeWidth="1.5" strokeLinecap="round" className="radar-arm" style={{ transformOrigin: '16px 16px' }}/>
                        </svg>
                        <span className="f-display" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                            Rival<span style={{ color: '#00e5ff' }}>Watch</span>
                        </span>
                    </div>

                    {/* Auth links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {auth?.user ? (
                            <Link href={route('dashboard')} style={{ fontSize: '0.875rem', color: '#94a3b8', textDecoration: 'none', padding: '8px 18px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', transition: 'color 0.2s, border-color 0.2s' }}
                                onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                                onMouseLeave={e => { e.target.style.color = '#94a3b8'; e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
                                Dashboard →
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link href={route('login')} style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#fff'}
                                        onMouseLeave={e => e.target.style.color = '#64748b'}>
                                        Sign in
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link href={route('register')} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#030912', background: '#00e5ff', padding: '9px 20px', borderRadius: '10px', textDecoration: 'none' }}>
                                        Get started
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </nav>

                {/* ══════════════════════════════
                    HERO
                ══════════════════════════════ */}
                <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    {/* Grid */}
                    <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.65 }}/>
                    {/* Radial glow */}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 55% at 55% 65%, rgba(0,80,110,0.18) 0%, transparent 70%)' }}/>

                    <div style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '80px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

                        {/* ── Left copy ── */}
                        <div>
                            {/* Live badge */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', marginBottom: '32px' }}>
                                <span className="dot-live" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00e5ff', display: 'inline-block' }}/>
                                <span className="section-label" style={{ textTransform: 'none', letterSpacing: '0.06em', fontSize: '0.72rem' }}>Live competitor intelligence</span>
                            </div>

                            <h1 className="f-display" style={{ fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.06, marginBottom: '28px', letterSpacing: '-0.03em' }}>
                                Every move<br />
                                <span key={activeCompetitor} className="accent-glow-text name-in">{COMPETITORS[activeCompetitor]}</span>
                                <br />makes.
                            </h1>

                            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.7, marginBottom: '40px', maxWidth: '460px' }}>
                                RivalWatch monitors your competitors 24/7, detects changes the moment they happen, and delivers AI-powered intelligence so you always stay one step ahead.
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '48px' }}>
                                {canRegister ? (
                                    <Link href={route('register')} className="glow-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', fontWeight: 600, color: '#030912', background: '#00e5ff', textDecoration: 'none', fontSize: '0.95rem' }}>
                                        Start watching for free
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                    </Link>
                                ) : (
                                    <Link href={route('login')} className="glow-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', fontWeight: 600, color: '#030912', background: '#00e5ff', textDecoration: 'none', fontSize: '0.95rem' }}>
                                        Sign in to dashboard
                                    </Link>
                                )}
                                <a href="#how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', fontSize: '0.95rem' }}>
                                    See how it works
                                </a>
                            </div>

                            {/* Trust signals */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                                {['No credit card required', 'Setup in 2 minutes', 'Cancel anytime'].map(t => (
                                    <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#475569' }}>
                                        <svg width="14" height="14" fill="#6ee7b7" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: Radar + live feed ── */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Radar */}
                            <div className="float-anim" style={{ width: '380px', height: '380px', position: 'relative' }}>
                                {/* Outer ambient glow */}
                                <div style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.07) 0%, transparent 70%)', filter: 'blur(24px)' }}/>

                                <svg width="380" height="380" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* BG circle */}
                                    <circle cx="200" cy="200" r="196" fill="rgba(3,9,18,0.92)" stroke="rgba(0,229,255,0.12)" strokeWidth="1"/>
                                    {/* Range rings */}
                                    <circle cx="200" cy="200" r="150" stroke="rgba(0,229,255,0.07)" strokeWidth="1"/>
                                    <circle cx="200" cy="200" r="100" stroke="rgba(0,229,255,0.09)" strokeWidth="1"/>
                                    <circle cx="200" cy="200" r="50"  stroke="rgba(0,229,255,0.12)" strokeWidth="1"/>
                                    {/* Crosshairs */}
                                    <line x1="200" y1="4"   x2="200" y2="396" stroke="rgba(0,229,255,0.05)" strokeWidth="1"/>
                                    <line x1="4"   y1="200" x2="396" y2="200" stroke="rgba(0,229,255,0.05)" strokeWidth="1"/>
                                    <line x1="55"  y1="55"  x2="345" y2="345" stroke="rgba(0,229,255,0.03)" strokeWidth="1"/>
                                    <line x1="345" y1="55"  x2="55"  y2="345" stroke="rgba(0,229,255,0.03)" strokeWidth="1"/>

                                    {/* Radar sweep arm + glow fan */}
                                    <g className="radar-arm">
                                        {/* Glow fan — wide blurred stroke simulating sweep trail */}
                                        <path d="M200 200 L200 8" stroke="rgba(0,229,255,0.12)" strokeWidth="80" strokeLinecap="round" style={{ filter: 'blur(12px)' }}/>
                                        {/* Sharp leading edge */}
                                        <path d="M200 200 L200 8" stroke="rgba(0,229,255,0.9)" strokeWidth="1.5" strokeLinecap="round"/>
                                    </g>

                                    {/* Blip 1 — cyan */}
                                    <circle cx="272" cy="128" r="5.5" fill="#00e5ff" opacity="0.95"/>
                                    <circle cx="272" cy="128" r="5.5" fill="none" stroke="#00e5ff" strokeWidth="1" opacity="0.4" className="ping-ring"/>
                                    {/* Blip 2 — emerald */}
                                    <circle cx="138" cy="282" r="4.5" fill="#6ee7b7" opacity="0.9"/>
                                    <circle cx="138" cy="282" r="4.5" fill="none" stroke="#6ee7b7" strokeWidth="1" opacity="0.4">
                                        <animate attributeName="r" values="6;20;6" dur="4s" repeatCount="indefinite" begin="1.1s"/>
                                        <animate attributeName="opacity" values="0.5;0;0.5" dur="4s" repeatCount="indefinite" begin="1.1s"/>
                                    </circle>
                                    {/* Blip 3 — amber */}
                                    <circle cx="312" cy="254" r="3.5" fill="#f59e0b" opacity="0.85"/>
                                    <circle cx="312" cy="254" r="3.5" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.4">
                                        <animate attributeName="r" values="5;16;5" dur="3.5s" repeatCount="indefinite" begin="0.5s"/>
                                        <animate attributeName="opacity" values="0.5;0;0.5" dur="3.5s" repeatCount="indefinite" begin="0.5s"/>
                                    </circle>
                                    {/* Blip 4 — purple, faint */}
                                    <circle cx="170" cy="155" r="3" fill="#a78bfa" opacity="0.7"/>

                                    {/* Center */}
                                    <circle cx="200" cy="200" r="8" fill="rgba(0,229,255,0.15)"/>
                                    <circle cx="200" cy="200" r="3.5" fill="#00e5ff"/>

                                    {/* Labels */}
                                    <text x="284" y="121" fill="rgba(0,229,255,0.75)" fontSize="9.5" fontFamily="monospace" letterSpacing="0.04em">stripe.com</text>
                                    <text x="96"  y="286" fill="rgba(110,231,183,0.75)" fontSize="9.5" fontFamily="monospace" letterSpacing="0.04em">notion.so</text>
                                    <text x="322" y="261" fill="rgba(245,158,11,0.75)"  fontSize="9.5" fontFamily="monospace" letterSpacing="0.04em">linear.app</text>
                                    <text x="130" y="145" fill="rgba(167,139,250,0.65)" fontSize="9.5" fontFamily="monospace" letterSpacing="0.04em">figma.com</text>
                                </svg>
                            </div>

                            {/* Live feed card */}
                            <div className="glass-card" style={{ position: 'absolute', right: '-16px', top: '16px', width: '220px', borderRadius: '16px', padding: '16px', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    <span className="dot-live" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6ee7b7', display: 'inline-block' }}/>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Live changes</span>
                                </div>
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    <div className="feed-anim">
                                        {FEED_ITEMS.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, display: 'inline-block', marginTop: '3px', flexShrink: 0 }}/>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, color: item.color, fontFamily: 'monospace' }}>{item.company}</p>
                                                    <p style={{ margin: '1px 0', fontSize: '0.7rem', color: '#94a3b8' }}>{item.change}</p>
                                                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#334155' }}>{item.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════
                    FEATURES
                ══════════════════════════════ */}
                <section id="features" style={{ padding: '96px 32px' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <p className="section-label" style={{ marginBottom: '16px' }}>Core intelligence</p>
                            <h2 className="f-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-0.03em' }}>
                                Everything you need to<br />outpace the competition
                            </h2>
                            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.65 }}>
                                Purpose-built tools for competitive intelligence that actually moves the needle.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {/* Feature 1 */}
                            <FeatureCard
                                iconBg="rgba(0,229,255,0.08)"
                                iconColor="#00e5ff"
                                borderColor="rgba(0,229,255,0.15)"
                                icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
                                title="24/7 Competitor Monitoring"
                                desc="Track unlimited competitor websites continuously. Set up monitoring in seconds — no code required. We watch so you don't have to."
                                bullets={['Any website, any page', 'Unlimited competitors', 'Hourly check frequency']}
                                checkClass="check-cyan"
                            />
                            {/* Feature 2 — highlighted */}
                            <FeatureCard
                                iconBg="rgba(110,231,183,0.08)"
                                iconColor="#6ee7b7"
                                borderColor="rgba(110,231,183,0.25)"
                                highlighted
                                badge="Most popular"
                                badgeColor="#6ee7b7"
                                icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
                                title="Instant Change Detection"
                                desc="Get alerted the moment a competitor changes their pricing, launches a product, or updates their messaging. Never be caught off-guard."
                                bullets={['Real-time Slack alerts', 'Visual diff highlights', 'Screenshot history']}
                                checkClass="check-emerald"
                            />
                            {/* Feature 3 */}
                            <FeatureCard
                                iconBg="rgba(167,139,250,0.08)"
                                iconColor="#a78bfa"
                                borderColor="rgba(167,139,250,0.15)"
                                icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg>}
                                title="AI-Powered Insights"
                                desc="Don't just see changes — understand them. Our AI analyzes competitor moves and tells you exactly what it means for your strategy."
                                bullets={['Strategy impact analysis', 'Trend identification', 'Weekly intelligence briefs']}
                                checkClass="check-purple"
                            />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════
                    HOW IT WORKS
                ══════════════════════════════ */}
                <section id="how-it-works" style={{ padding: '96px 32px', position: 'relative' }}>
                    <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }}/>
                    <div style={{ position: 'relative', maxWidth: '1280px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <p className="section-label" style={{ marginBottom: '16px' }}>How it works</p>
                            <h2 className="f-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                                Up and running in minutes
                            </h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', position: 'relative' }}>
                            {/* Connector line */}
                            <div style={{ position: 'absolute', top: '44px', left: 'calc(16.5% + 44px)', right: 'calc(16.5% + 44px)', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,229,255,0.25), transparent)' }}/>

                            {[
                                {
                                    title: 'Add your competitors',
                                    desc: 'Paste in any website URL. Add as many competitors as you like. RivalWatch starts scanning immediately.',
                                    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4"/></svg>
                                },
                                {
                                    title: 'We monitor 24/7',
                                    desc: 'Our crawlers continuously watch every page you care about. Any change — no matter how small — is captured the instant it happens.',
                                    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                },
                                {
                                    title: 'Act on intelligence',
                                    desc: 'Receive instant alerts and AI-generated analysis explaining exactly what changed and why it matters for your competitive strategy.',
                                    icon: <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                }
                            ].map((step, i) => (
                                <div key={i} style={{ textAlign: 'center' }}>
                                    <div style={{ position: 'relative', width: '88px', height: '88px', margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.2)' }}>
                                        <span style={{ position: 'absolute', top: '-12px', right: '-12px', width: '28px', height: '28px', borderRadius: '50%', background: '#00e5ff', color: '#030912', fontSize: '0.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif' }}>
                                            {i + 1}
                                        </span>
                                        <span style={{ color: '#00e5ff' }}>{step.icon}</span>
                                    </div>
                                    <h3 className="f-display" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '12px', letterSpacing: '-0.02em' }}>{step.title}</h3>
                                    <p style={{ color: '#475569', lineHeight: 1.65, fontSize: '0.9rem' }}>{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════
                    PRICING
                ══════════════════════════════ */}
                <section id="pricing" style={{ padding: '96px 32px' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                            <p className="section-label" style={{ marginBottom: '16px' }}>Pricing</p>
                            <h2 className="f-display" style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '12px', letterSpacing: '-0.03em' }}>
                                Simple, transparent pricing
                            </h2>
                            <p style={{ color: '#475569', fontSize: '1rem' }}>Start free. Scale as you grow.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '960px', margin: '0 auto' }}>
                            <PricingCard
                                title="Starter"
                                subtitle="For individuals"
                                price="Free"
                                features={['3 competitors', 'Daily monitoring', 'Email alerts', '30-day history']}
                                cta={canRegister ? <Link href={route('register')} style={outlineBtn}>Get started free</Link> : <Link href={route('login')} style={outlineBtn}>Sign in</Link>}
                                checkColor="#00e5ff"
                            />
                            <PricingCard
                                title="Pro"
                                subtitle="For growing teams"
                                price="$49"
                                priceNote="/month"
                                features={['25 competitors', 'Hourly monitoring', 'Slack + email alerts', 'AI insights', '1-year history', 'Visual diffs']}
                                highlighted
                                cta={canRegister ? <Link href={route('register')} style={filledBtn}>Start free trial</Link> : <Link href={route('login')} style={filledBtn}>Sign in</Link>}
                                checkColor="#00e5ff"
                                badge="Most popular"
                            />
                            <PricingCard
                                title="Enterprise"
                                subtitle="For large organizations"
                                price="Custom"
                                features={['Unlimited competitors', 'Real-time monitoring', 'Custom integrations', 'Dedicated AI analyst', 'SLA guarantee', 'SSO + SAML']}
                                cta={<a href="mailto:hello@rivalwatch.com" style={outlineBtn}>Contact sales</a>}
                                checkColor="#a78bfa"
                            />
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════
                    FINAL CTA BANNER
                ══════════════════════════════ */}
                <section style={{ padding: '96px 32px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 65% 75% at 50% 50%, rgba(0,90,115,0.22) 0%, transparent 70%)' }}/>
                    <div style={{ position: 'relative', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 className="f-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.03em' }}>
                            Start watching your<br />competition today
                        </h2>
                        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '40px' }}>
                            Join hundreds of businesses using RivalWatch to stay ahead. Free forever for up to 3 competitors.
                        </p>
                        {canRegister ? (
                            <Link href={route('register')} className="glow-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px', borderRadius: '14px', fontWeight: 700, color: '#030912', background: '#00e5ff', textDecoration: 'none', fontSize: '1rem' }}>
                                Create your free account
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                            </Link>
                        ) : (
                            <Link href={route('login')} className="glow-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px', borderRadius: '14px', fontWeight: 700, color: '#030912', background: '#00e5ff', textDecoration: 'none', fontSize: '1rem' }}>
                                Sign in to your account
                            </Link>
                        )}
                    </div>
                </section>

                {/* ══════════════════════════════
                    FOOTER
                ══════════════════════════════ */}
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '40px 32px' }}>
                    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="15" stroke="rgba(0,229,255,0.25)" strokeWidth="1"/>
                                <circle cx="16" cy="16" r="8"  stroke="rgba(0,229,255,0.35)" strokeWidth="1"/>
                                <circle cx="16" cy="16" r="2.5" fill="#00e5ff"/>
                            </svg>
                            <span className="f-display" style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>
                                Rival<span style={{ color: '#00e5ff' }}>Watch</span>
                            </span>
                        </div>
                        <p style={{ color: '#1e293b', fontSize: '0.8rem', margin: 0 }}>
                            © {new Date().getFullYear()} RivalWatch. All rights reserved.
                        </p>
                        <div style={{ display: 'flex', gap: '24px' }}>
                            {['Privacy', 'Terms', 'Contact'].map(l => (
                                <a key={l} href={l === 'Contact' ? 'mailto:hello@rivalwatch.com' : '#'} style={{ fontSize: '0.8rem', color: '#334155', textDecoration: 'none', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.target.style.color = '#94a3b8'}
                                    onMouseLeave={e => e.target.style.color = '#334155'}>
                                    {l}
                                </a>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

/* ── Shared button styles ── */
const outlineBtn = {
    display: 'block',
    textAlign: 'center',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'border-color 0.2s, color 0.2s',
};

const filledBtn = {
    display: 'block',
    textAlign: 'center',
    padding: '12px 20px',
    borderRadius: '10px',
    background: '#00e5ff',
    color: '#030912',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 700,
};

/* ── FeatureCard ── */
function FeatureCard({ icon, iconBg, iconColor, borderColor, title, desc, bullets, checkClass, highlighted, badge, badgeColor }) {
    return (
        <div style={{
            background: highlighted ? 'rgba(0,229,255,0.04)' : 'rgba(255,255,255,0.025)',
            border: `1px solid ${borderColor || 'rgba(255,255,255,0.07)'}`,
            borderRadius: '20px',
            padding: '36px',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            boxShadow: highlighted ? '0 0 60px rgba(0,229,255,0.06)' : 'none',
        }}>
            {badge && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px 10px', borderRadius: '999px', background: `rgba(${badgeColor === '#6ee7b7' ? '110,231,183' : '0,229,255'},0.1)`, color: badgeColor, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {badge}
                </div>
            )}
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: iconColor }}>
                {icon}
            </div>
            <h3 className="f-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '12px', letterSpacing: '-0.02em' }}>{title}</h3>
            <p style={{ color: '#475569', lineHeight: 1.65, fontSize: '0.875rem', marginBottom: '24px' }}>{desc}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bullets.map(b => (
                    <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                        <svg className={checkClass} width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        {b}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ── PricingCard ── */
function PricingCard({ title, subtitle, price, priceNote, features, cta, highlighted, badge, checkColor }) {
    return (
        <div style={{
            background: highlighted ? 'rgba(0,229,255,0.04)' : 'rgba(255,255,255,0.025)',
            border: `1px solid ${highlighted ? 'rgba(0,229,255,0.28)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '20px',
            padding: '32px',
            position: 'relative',
            boxShadow: highlighted ? '0 0 60px rgba(0,229,255,0.07)' : 'none',
        }}>
            {badge && (
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: '999px', background: '#00e5ff', color: '#030912', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {badge.toUpperCase()}
                </div>
            )}
            <h3 className="f-display" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{title}</h3>
            <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '20px' }}>{subtitle}</p>
            <div style={{ marginBottom: '24px' }}>
                <span className="f-display" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff' }}>{price}</span>
                {priceNote && <span style={{ fontSize: '0.85rem', color: '#475569' }}>{priceNote}</span>}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: highlighted ? '#94a3b8' : '#64748b' }}>
                        <svg width="14" height="14" fill={checkColor} viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        {f}
                    </li>
                ))}
            </ul>
            {cta}
        </div>
    );
}
