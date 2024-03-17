import React from "react";

const Button = ({handler, children, className, isLoading, title}) => {
    return (
        <button
            className={`${className} ${isLoading ? " btn-disable" : ""}`}
            onClick={(e) => {
            (handler && !isLoading) ? handler(e) : false
        }}
            title={title ? title : ""}
        >
            {isLoading ? <div className="btn-loading"/> : null}
            {children ? children : null}
        </button>
    );
}

export default Button;