const DiamondTrophySVG: React.FC<{className?: string}> = ({className}) => (
    <svg
        className={`h-20 w-20 flex-no-shrink ${className || ''}`}
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Top triangles */}
        <path fill="#10ebe4" d="M158.6 41l34.5 69.1L239.2 41z" />
        <path fill="#10ebe4" d="M272.8 41l46.1 69.1L353.4 41z" />
        
        {/* Middle triangles */}
        <path fill="#04c6c0" d="M256 48.22L208.8 119h94.4z" />
        <path fill="#04b6b0" d="M142.1 48.36L83.22 119h94.18z" />
        <path fill="#04a6a0" d="M369.9 48.36L334.6 119h94.2z" />
        
        {/* Large middle sections */}
        <path fill="#049690" d="M80.82 137L196.8 311H249l-63.4-174z" />
        <path fill="#048680" d="M204.9 137L256 277.7 307.1 137z" />
        <path fill="#047670" d="M326.4 137L263 311h52.2l116-174z" />
        
        {/* Bottom sections */}
        <path fill="#046660" d="M201 329v46h110v-46z" />
        <path fill="#045650" d="M133.2 393l-53.69 94H432.5l-53.7-94H183z" />
        <path fill="#044640" d="M160 439h192v18H160z" />
    </svg>
);


export default DiamondTrophySVG