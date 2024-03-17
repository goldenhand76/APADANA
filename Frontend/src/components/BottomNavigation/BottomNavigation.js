import React, { Component } from "react";
import { Switch, Route, Redirect, Link } from "react-router-dom";
import mainRoutes from "../../routes/main";
import { store } from '../../redux/store';

export default class BottomNavigation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      redirectToLogin: false,
      collapseId: null,
      subMenuRedirect: null
    };
  }


  render() {
    const { routes } = this.props;
    const from = { pathname: "/Hosting" };
    const { redirectToLogin } = this.state;
    const links = [];
    if (redirectToLogin) {
      return <Redirect to={from} />;
    }
    routes.map((prop, key) => {
      if (prop.bottomNavigation) {
        this.props.hasPermission(prop) && links.push(
          <div className="col px-0" key={key} >
            <Link to={prop.path} className={"nav-link p-0 " + (this.props.location && this.props.location.pathname === prop.path ? "active " : "")} >
              <div className="d-flex flex-column align-items-center">
                <i className={"icon icon-24 " + prop.iconClass}/>
                <span className="mt-1 font-size-sm small">{prop.sidebarName}</span>
              </div>
            </Link>
          </div>
        );
      }
    });
    return (
      <div className="bottom-navigation position-fixed">
        <div className="row p-2 pl-3">
          {links}
        </div>
      </div>
    );
  }
};