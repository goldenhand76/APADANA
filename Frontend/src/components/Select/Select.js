import React, { Component } from "react";
import { isMobile } from 'react-device-detect';
import SelectItem from './SelectItem';
import "./style/select.scss";

export default class ReactSelect extends Component {

    constructor(props) {
        super(props);

        this.state = {
            filterText: null,
            data: [],
            isOpen: false,
            selectedItem: null
        };

        this.selected = this.selected.bind(this);
        this.filterTextChanged = this.filterTextChanged.bind(this);
        this.openList = this.openList.bind(this);
        this.clickOutSide = this.clickOutSide.bind(this);
        this.key = Math.random(); // new key for each 
    }

    componentDidMount() {
        window.addEventListener("click", this.clickOutSide);
    }

    componentWillUnmount() {
        window.removeEventListener("click", this.clickOutSide.bind(this));
    }


    clickOutSide(e) {
        if (+e.target.id !== this.key && +e.target.parentNode.id !== this.key) {
            this.setState({
                isOpen: false,
                filterText: null
            });
        }
    }

    selected(data) {
        if (this.props.onChange) {
            this.props.onChange(data);
            this.setState({
                selectedItem: data,
                isOpen: false,
                filterText: null
            });
        }
    }

    openList(e) {
        // e.stopPropagation(); // prevent click event ( clickOutSide will not be happen )
        const { isOpen } = this.state;
        if (!isOpen) {
            setTimeout(function () {
                this.refs.selectInput.focus();
                const len = this.refs.selectInput.value.length * 2;
                this.refs.selectInput.setSelectionRange(0, len);
            }.bind(this), 50);
        }
        this.setState({
            isOpen: !isOpen
        });
    }

    filterTextChanged(e) {
        this.setState({
            filterText: e.target.value
        });
    }

    filterItemsByLabelText(text) {
        const { options } = this.props;
        let result = [];
        text = this.fixNumbers(text);
        if (options.length > 0) {
            for (let i = 0; i < options.length; i++) {
                const item = options[i];
                if (item.label && item.label.includes(text)) {
                    result.push(item);
                }
            }
        }
        return result;
    }

    fixNumbers(str) {
        const
            persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g],
            engNumbers = [/0/g, /1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g];
        if (typeof str === 'string') {
            for (var i = 0; i < 10; i++) {
                str = str.replace(persianNumbers[i], i).replace(engNumbers[i], i);
            }
        }
        return str;
    }

    render() {
        const { filterText, isOpen, selectedItem } = this.state;
        const { options, placeholder, className, value, inputClassName, mobileMode, isIcon, size } = this.props;
        const items = [];
        let listSizeHeight = 0;
        const itemSelected = value || selectedItem;
        if (isOpen && options?.length > 0) {
            let data = options;
            if (filterText && filterText.length > 0) {
                data = this.filterItemsByLabelText(filterText);
            }

            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                let isSelected = false;
                if (itemSelected?.value === item?.value) {
                    isSelected = true;
                }
                items.push(<SelectItem key={i} data={item} selected={this.selected} isSelected={isSelected} mobileMode={mobileMode} />);
            }
            if (items.length < 5) {
                listSizeHeight = items.length * 54;
            }
            else if(size === "small") {
                listSizeHeight = 180;
            }
            else {
                listSizeHeight = 5 * 54;
            }
        }
        if (isMobile && mobileMode && isOpen)
        {
            return (
                <div className="select-container-overlay mobile-mode " >
                    <div className={"select-container p-0 position-relative " + (isOpen ? "is-open " : " ") + (className ? className : "")} >
                        <div className={"select-input-content "} onClick={this.openList} >
                            {/* <div className={"position-absolute pr-2 " }>{ (filterText !== null && itemSelected) ? itemSelected.label : "" }</div> */}
                            <input className={"select-input border-bottom " + (isIcon ? "pr-5" : "pr-3") + (inputClassName ? inputClassName : "")} autoCapitalize="none"
                                autoComplete="off" autoCorrect="off" id="select-input" ref="selectInput" spellCheck="false" tabIndex="0"
                                type="text" aria-autocomplete="list" onChange={this.filterTextChanged}
                                value={(filterText === null && itemSelected) ? itemSelected.label : filterText} onClick={(e) => { e.stopPropagation(); }}
                            />
                            <div className="position-absolute select-input-close" >
                                <svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><g id="cancel-music" transform="translate(0 0)"><path id="Path_962" data-name="Path 962" d="M8.664,7l4.992-4.992A1.177,1.177,0,0,0,11.992.344L7,5.336,2.009.344A1.177,1.177,0,0,0,.345,2.008L5.336,7,.345,11.991a1.177,1.177,0,1,0,1.664,1.664L7,8.663l4.992,4.992a1.177,1.177,0,0,0,1.664-1.664Z" transform="translate(0)" fill="%234A4A4A" fillRule="evenodd" /></g></svg>
                            </div>
                        </div>
                    </div>
                    {
                        (isOpen && items.length > 0) ?
                            <div className="select-list position-absolute " >
                                {items}
                            </div>
                            : null
                    }
                </div>
            );
        }
        return (
            <div className={"select-container position-relative " + (isOpen ? "is-open " : " ") + (className ? className : "")}  >
                <div className={"select-input-content "} onClick={this.openList} id={"" + this.key} >
                    {/* <div className={"position-absolute pr-2 " }>{ (filterText === null && itemSelected) ? itemSelected.label : (filterText && placeholder ? placeholder : "") }</div> */}
                    {
                        isOpen ? 
                        <input className={"select-input " + (isIcon ? "pr-5" : "pr-3") + (inputClassName ? inputClassName : "")} autoCapitalize="none"
                            autoComplete="off" autoCorrect="off" id="select-input" ref="selectInput" spellCheck="false" tabIndex="0"
                            type="text" aria-autocomplete="list" onChange={this.filterTextChanged}
                            value={(filterText === null && itemSelected && itemSelected?.value != -1) ? itemSelected.label :
                                (filterText && filterText.length > 0 ? filterText : "")} placeholder={placeholder ? placeholder : ""}
                        />
                        : <input className={"select-input " + (isIcon ? "pr-5" : "pr-3") + (inputClassName ? inputClassName : "")} autoCapitalize="none"
                            autoComplete="off" autoCorrect="off" id="select-input" ref="selectInput" spellCheck="false" tabIndex="0"
                            type="text" aria-autocomplete="list" onChange={this.filterTextChanged} disabled
                            value={(filterText === null && itemSelected && itemSelected?.value != -1) ? itemSelected.label :
                                (filterText && filterText.length > 0 ? filterText : "")} placeholder={placeholder ? placeholder : ""}
                        />
                    }
                    <div className="position-absolute select-input-arrow" >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="#646464" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>
                {
                    (isOpen && items.length > 0) ?
                        <div className="select-list position-absolute border " style={{ height: listSizeHeight + "px" }} >
                            {items}
                        </div>
                        : null
                }
            </div>
        );
    }
};