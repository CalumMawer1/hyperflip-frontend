"use client"
import "./style/LoadingBarStyle.css"
import {useState, useEffect} from "react"

const LoadingBar: React.FC = () => {
    const [isMounted, setIsMounted] = useState<boolean>(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])    
    if (!isMounted) {
        return <></>
    }
    return (
        <div className="fixed top-0 left-0 w-full h-1 z-50">
            <div className="h-full bg-gradient-to-r from-[#04e6e0] to-[#8B5CF6] loading-bar-animation"></div>
        </div>
    )
}


export default LoadingBar;