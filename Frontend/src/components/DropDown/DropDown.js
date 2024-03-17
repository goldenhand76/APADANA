import React, { Component } from "react";

export default class DropDown extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      subMenuIsOpen: false
    };
  }

  OpenToggle() {
    this.setState(prevState => ({
      subMenuIsOpen: !prevState.subMenuIsOpen
    }));
  }

  render() {
    const {children, className, title} = this.props;
    const {subMenuIsOpen} = this.state;
    if(children && title) {
      return(
        <div className={"drop-down btn-group dropdown " + (this.state.subMenuIsOpen ? "show " : " " + className)}>
          <button onClick={() => {this.OpenToggle()}} className="col btn btn-white btn-lg dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {title}
          </button>
          <div className={"dropdown-menu "+ (subMenuIsOpen ? "show" : "")} aria-labelledby="dropdownMenuButton">
            {children}
          </div>
        </div>
      );
    }
    else {
      <div/>
    }
  }
};