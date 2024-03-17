import React, { Component } from "react";

export default class Progress extends Component {
// const Sidebar = ({ ...props }) => {
  // verifies if routeName is the one active (in browser input)

  constructor(props) {
    super(props);
  
    this.state = {

    };

  }
  
  componentDidMount() {
      
  }

  render() {
    const {value} = this.props;
    return (
        // <div className="progress">
        //     <div className="progress-bar" role="progressbar" style="width: 75%" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100"></div>
        // </div>
        <div className="progress progress-loading">
          <div className="progress-bar" style={{width: value+"%"}} aria-valuenow={value} aria-valuemin="0" aria-valuemax="100"></div>
        </div>
    );
  }
};