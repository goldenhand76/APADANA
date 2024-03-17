import React from "react";
import {connect} from "react-redux";

const HeaderAction = ({headerAction}) => {
    return (
        <div className="action-bar">
            <span className="icon icon-20 icon-arrow-right mr-3 cursor-pointer" onClick={() => history.back()}/>
            <span className="mr-2">{headerAction}</span>
        </div>
    )
}

const mapStateToProps = state => ({
    headerAction: state.headerAction
});

export default connect(mapStateToProps, null)(HeaderAction);

