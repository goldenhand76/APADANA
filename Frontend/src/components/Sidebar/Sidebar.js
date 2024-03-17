import React, { Component } from "react";
import {Redirect, Link } from "react-router-dom";
import { store } from '../../redux/store';

export default class Sidebar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      redirectToLogin: false,
      collapseId: null,
      update: null,
      sidebarIsOpen: true,
      subMenuRedirect: null,
    };

    this.handleDrawer  =this.handleDrawer.bind(this);

    store.subscribe(() => {
      const { profile } = store.getState();
      this.setState({
        profile: profile
      });
    });
  }

  componentDidMount() {
    if (window.sessionStorage.collapseId) {
      this.state.collapseId = window.sessionStorage.collapseId;
    }
  }

  collapseSub(id, subs) {
    if (window.sessionStorage.collapseId === id) {
      window.sessionStorage.collapseId = null;
      this.setState({
        collapseId: null,
        subMenuRedirect: null
      });
    }
    else {
      window.sessionStorage.collapseId = id;
    }
  }

  handleDrawer() {
    const {sidebarIsOpen} = this.state;
    this.setState({
      sidebarIsOpen: !sidebarIsOpen
    });
  }

  render() {
    const { routes } = this.props;
    const { redirectToLogin, subMenuRedirect, sidebarIsOpen } = this.state;
    const from = { pathname: "/Login" };
    const links = [];
    if (redirectToLogin) {
      return <Redirect to={from} />;
    }
    if (subMenuRedirect) {
      const from = subMenuRedirect;
      this.state.subMenuRedirect = null;
      return <Redirect to={from} />;
    }
    routes.map((prop, key) => {
      if (prop.redirect) return;
      if (!prop.sidebarName) return;
      const locs = location.pathname.split("Panel/")[1];
      const pageCategory = (locs && locs.length > 0) ? locs.split("/")[0] : null;
      if (prop.pageCategory === pageCategory) {
        if (prop.subs) {
          const subs = [];
          let list = prop.subs.sort(function (a, b) { return a.order - b.order });
          list.map((sub, k) => {
            subs.push(
              <li className="nav-item" key={k}>
                {
                  sub.externalLink ?
                    <Link to={"#"} onClick={() => this.externalLink(sub.path)} className={"nav-link " + (this.props.location && this.props.location.pathname === sub.path ? "active " : "")} >
                      {sub.sidebarName}
                    </Link>
                    :
                    <Link to={sub.path} className={"nav-link" + (this.props.location && this.props.location.pathname === sub.path ? "active " : "")} >
                      {sub.sidebarName}
                    </Link>
                }
              </li>
            );
          });
          links.push(
            <li className="nav-item" key={key}>
              <a name={prop.id} onClick={() => this.collapseSub(prop.id, list)} className={"nav-link " + (this.state.collapseId === prop.id ? "sub-active " : "")} data-toggle="collapse"><i className={"icon icon-20 ml-2 " + prop.iconClass}></i> <span>{prop.sidebarName} </span></a>
              <div className={"collapse " + (this.state.collapseId === prop.id ? "show " : "")} id={prop.id}>
                <ul className="nav flex-column">
                  {subs}
                </ul>
              </div>
            </li>
          );
        }
        else {
          this.props.hasPermission(prop) && links.push(
            <li className={"nav-item position-relative " + (this.props.location && this.props.location.pathname === prop.path ? "active " : "")} key={key}>
              <Link to={prop.path} className={' d-flex align-items-center ml-2 pr-3 mr-2' }>
                <i className={"icon icon-24 " + prop.iconClass}/>
                <span className="mr-3">{prop.sidebarName}</span>
              </Link>
            </li>
          );
        }
      }
    });

    return (
        <div className={"side-bar-wrapper position-fixed bg-white " + (sidebarIsOpen ? "is-open " : "")}>
          <div className="side-bar">
            <div className="menu mt-1">
              <ul className="nav">
                {links}
                <span className={`indicator`}/>
              </ul>
            </div>
          </div>
        </div>
    );
  }
};