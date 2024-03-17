import React from "react";
const LoaderAutomation = ({display}) => {
    return (
        <div className={`loading-automation ${display}`}>
            <span className="loading-indicator"/>
            <span className="loading-indicator"/>
            <span className="loading-indicator"/>
            <span className="loading-indicator"/>
        </div>
    )
}

export default LoaderAutomation;