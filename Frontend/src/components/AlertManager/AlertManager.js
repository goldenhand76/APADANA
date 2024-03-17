import React, { Component } from "react";
import Alert from "../Alert/Alert.js";
import { store } from '../../redux/store';
import { Link } from 'react-router-dom';


export default class AlertManager extends Component {

  constructor(props) {
    super(props);

    this.state = {
      messagesData: []
    };

    store.subscribe(() => {
      const { alerts } = store.getState();
      this.setState({
        messagesData: alerts
      });
    });
  }

  createMessage(msg) {
    let link = null;
    if (msg.action) {
      link = this.createLink(msg);
    }
    return (
      <Alert type="primary" className="col d-flex mb-3" key={msg.name + Math.random().toString()}>
        <div className="pl-1">{msg.message}
          {link ? link : null}
        </div>
      </Alert>
    )
  }

  createLink(msg) {
    if (msg.target === "booking") {
      if (msg.action.name === "list") {
        return <Link to={{
          pathname: "/Hosting/Bookings/" + this.formatFilterOrder(msg.action),
          // search: this.formatFilterOrder(msg.action),
        }}
        > (مشاهده اطلاعات درخواست)</Link>;
      }
      else if (msg.action.name === "show") {
        return <Link to={{ pathname: `/Hosting/Bookings/Detail/${msg.targetId}` }}> (مشاهده اطلاعات درخواست)</Link>;
      }
    }
    else if (msg.target === "rental") {
      if (msg.action.name === "list") {
        if (msg.action.filters && msg.action.filters.length > 0) {
          return <Link to={{
            pathname: "/Hosting/House/Houses",
            search: this.formatFilterOrder(msg.action),
          }} > (مشاهده اقامتگاه های تکمیل نشده)</Link>;
        }
        else {
          if (msg.action.filters && msg.action.filters.length > 0) {
            return <Link to={{
              pathname: "/Hosting/House/Houses",
            }} > (مشاهده اقامتگاه ها)</Link>;
          }
        }
      }
      else if (msg.action.name === "show") {
        if (msg.action.filters && msg.action.filters.length > 0) {
          return <Link to={{
            pathname: `/Hosting/Houses/HouseDetail/${msg.targetId}`,
            search: this.formatFilterOrder(msg.action),
          }} > (مشاهده اقامتگاه)</Link>;
        }
        else {
          return <Link to={{
            pathname: `/Hosting/Houses/HouseDetail/${msg.targetId}`,
          }} > (مشاهده اقامتگاه)</Link>;
        }
      }
      else if (msg.action.name === "edit") {
        return <a href={`/Houses/${+msg.targetId}/Edit`} > (ویرایش اقامتگاه)</a>;
      }
      else if (msg.action.name === "edit#images") {
        return <a href={`/Houses/${+msg.targetId}/Edit#images`} > (آپلود عکس)</a>;
      }
      else if (msg.action.name === "pricing") {
        return <a href={`/Houses/${+msg.targetId}/Pricing`} > (ورود به صفحه قیمت‌گذاری)</a>;
      }
    }
    else if (msg.target === "user") {
      if (msg.name === "user_accounting_number") {
        if (msg.action.name === "edit") {
          return <Link to={{
            pathname: "/Hosting/Profiles/Profile",
            search: this.formatFilterOrder(msg.action),
            hash: "generalInfo"
          }} > (ویرایش اطلاعات عمومی)</Link>;
        }
      }
      if (msg.action.name === "list") {

      }
      else if (msg.action.name === "show") {

      }
      else if (msg.action.name === "edit") {
        return <Link to={{
          pathname: "/Hosting/Profiles/Profile",
          search: this.formatFilterOrder(msg.action),
          hash: "nationalCard"
        }} > (آپلود کارت ملی)</Link>; //fixme add filters
      }
    }
  }

  formatFilterOrder(action) {
    let str = "";
    const { filters, orders } = action;
    if (filters || orders) {
      if (filters) {
        const filtersList = [];
        for (let i = 0; i < filters.length; i++) {
          filtersList.push(filters[i]);
        }
        str += "filters=" + JSON.stringify(filtersList);
      }
      if (orders) {
        if (filters)
          str += "&";
        const ordersList = [];
        for (let i = 0; i < orders.length; i++) {
          ordersList.push(orders[i]);
        }
        str += "orders=" + JSON.stringify(ordersList);
      }
    }
    return str;
  }

  render() {
    const { className } = this.props;
    const { messagesData } = this.state;
    // let messagesList = [];
    let message = null;
    if (messagesData.length > 0) {
      message = messagesData[0];
      for (let key in messagesData) {
        // messagesList.push(this.createMessage(messagesData[key]));
        if (message.order > messagesData[key].order)
          message = messagesData[key];
      }
      message = this.createMessage(message);
    }
    return (
      <div className={"mx-lg-3 mx-0 " + (message ? "" : "")}>
        {
          // messagesList
          message
        }
      </div>
    );
  }
};