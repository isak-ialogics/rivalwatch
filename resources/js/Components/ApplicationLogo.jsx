export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <div className={`flex items-center gap-2 ${className}`} {...props}>
            <svg width="28" height="28" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="200" cy="200" r="180" stroke="#00e5ff" strokeWidth="2" opacity="0.3" />
                <circle cx="200" cy="200" r="120" stroke="#00e5ff" strokeWidth="1.5" opacity="0.2" />
                <circle cx="200" cy="200" r="60" stroke="#00e5ff" strokeWidth="1" opacity="0.15" />
                <line x1="200" y1="200" x2="200" y2="40" stroke="#00e5ff" strokeWidth="2.5" opacity="0.8" strokeLinecap="round" />
                <circle cx="200" cy="200" r="6" fill="#00e5ff" />
                <circle cx="280" cy="140" r="5" fill="#6ee7b7" opacity="0.9" />
                <circle cx="150" cy="100" r="4" fill="#f59e0b" opacity="0.8" />
                <circle cx="300" cy="220" r="4" fill="#a78bfa" opacity="0.8" />
            </svg>
            <span className="f-display text-base font-bold tracking-tight text-white">
                Rival<span style={{ color: '#00e5ff' }}>Watch</span>
            </span>
        </div>
    );
}
