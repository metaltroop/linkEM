export const IndustrialGrid = () => {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-industrial-grid bg-grid-sm opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

            {/* Subtle scanline effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
    );
};
