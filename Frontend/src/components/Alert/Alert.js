import React, { Component } from "react";

export default class Alert extends Component {

  constructor(props) {
    super(props);
  
    this.state = {
      isClear: false
    };

    this.close = this.close.bind(this);
  }

  close() {
    this.setState({
      isClear: true
    });
  }

  render() {
    const {src, className, children, type} = this.props;
    const {isClear} = this.state;
    if(!isClear)
      return(
          <div className={"alert-dismissible fade show alert "+ (type ? "alert-"+type+" " : " ") + (className || "")} role="alert">
              {children ? children: null}
              <button type="button" className="close" onClick={this.close}>
                <span aria-hidden="true">&times;</span>
              </button>
          </div>
      );
    else
        return(null);
  }
};