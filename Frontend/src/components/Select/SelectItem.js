import React, {Component} from "react";
import {isMobile} from 'react-device-detect';

export default class SelectItem extends Component {

    constructor(props) {
        super(props);

        this.state = {};

        this.selected = this.selected.bind(this);

    }

    componentDidMount() {
    }

    selected() {
        const {data} = this.props;
        if (this.props.selected) {
            this.props.selected(data);
        }
    }

    render() {
        const {data, className, isSelected, mobileMode} = this.props;
        return (
            <div className={"select-item px-2 " + (isSelected ? "selected" : "")} onClick={this.selected}>
                <div className="select-item-label py-3">
                    {data.label ? data.label : ""}
                </div>
            </div>
        );
    }
};