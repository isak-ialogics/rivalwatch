export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-white/[0.1] bg-white/[0.05] text-cyan-500 shadow-sm focus:ring-cyan-500 ' +
                className
            }
        />
    );
}
