import React, { Component } from "react";

export default class Loader extends Component {
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
    const { className } = this.props;
    return (
      <div className = { "loading mx-2 " + className } ></div>
    );
  }
};