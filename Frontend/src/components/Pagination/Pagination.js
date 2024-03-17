import React, { Component } from "react";
import {isMobile, isTablet} from 'react-device-detect';
import './style/style.css';

export default class Pagination extends Component {

  constructor(props) {
    super(props);
    this.pageNumber = React.createRef();
    
    this.state = {
      pageSize: this.props.pageSize || 2,
      dataList: [],
      pageCount: 0,
      page: 1,
      currentPageIndex: 1,
    };

    this.pageNumberClick = this.pageNumberClick.bind(this);
    this.rowClick = this.rowClick.bind(this);
    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    const { apiLoadFunction } = this.props;
    if(this.props.apiLoadFunction) { 
      this.getData();
    }
  }

  componentDidUpdate(state, props) {
    if(this.props.apiLoadFunction !== state.apiLoadFunction) { // new update
      this.setState({
        currentPageIndex: 1
      });
      this.getData();
      return;
    }
  }

  getData() {
    const { apiLoadFunction } = this.props;
    const { page, pageSize, currentPageIndex } = this.state;
    // const param = {page: page, count: pageSize };
    const param = {page: currentPageIndex, count: pageSize };
    apiLoadFunction(param)
    .then((res) => {
      this.setState({
        dataList: res.list,
        pageCount: Math.ceil(res.total / pageSize)
      })
    }).catch((err) => {
      this.setState({
        isLoading: false,
        retryData: true
      });
    });

  }

  changePage(e, pageNumber) {
    if(e.preventDefault) {
      e.preventDefault();
    }
    const { apiLoadFunction } = this.props;
    const { pageCount, currentPageIndex } = this.state;
    if(pageNumber > 0 && pageNumber <= pageCount) {
      this.state.currentPageIndex = +pageNumber;
      // this.state.page = this.state.currentPageIndex;
      this.setState({
        currentPageIndex: +pageNumber,
        page: +pageNumber,
        // isLoading: true
      });
      if(apiLoadFunction) {
        setTimeout(function() {
          this.getData();
        }.bind(this), 50);
      }
    }
    else
      return;
  }

  keyPress(e) {
    if(e.keyCode == 13) {
      this.changePage(e, this.state.currentPageIndex);
    }
  }

  pageNumberClick(e) {
    this.pageNumber.current.select();
  }

  pageNumberChanged(e, pageNumber) {
    const {pageCount} = this.state;
    if(pageNumber <= pageCount) {
      this.setState({currentPageIndex: pageNumber});
    }
  }

  rowClick(rowData) {
    const {rowClick} = this.props;
    if(rowClick)
      rowClick(rowData);
  }

  createList() {
    const { data, template } = this.props;
    const { dataList } = this.state;
    const dataRows = (dataList && dataList.length > 0 ? dataList : (data && data.length > 0 ? data : []) );
    const result = [];
    if(dataRows.length > 0 && template) {
      for (let i = 0; i < dataRows.length; i++) {
        result.push(<div key={i} className="pagination-row" onClick={(e) => this.rowClick(dataRows[i])}>{template(dataRows[i])}</div>);
      }
    }

    return result;
  }

  createFooter() {
    const { currentPageIndex, pageCount, pageSize } = this.state;
    const pages = [];
    if(isMobile) {
      return (
        <nav className="d-flex justify-content-center p-0 mt-3 mx-auto ">
          <ul className="row pagination pr-0">
            <li className={"page-item page-item-arrow " + (currentPageIndex > 1 ? "": "disabled")} key={"prev"}>
              <a className="page-link p-2" onClick={(e) => this.changePage(e, currentPageIndex - 1)}>
                <i className={"icon icon-14 item-arrow-right mb-1 " + 
                  ( currentPageIndex > 1 ? "icon-keyboard-arrow-right" : "icon-keyboard-arrow-right-gray")}></i>
              </a>
            </li>
            <input className="px-2 text-center border rounded " value={currentPageIndex} type="number" min="1" max={ pageCount }
              maxLength="3" onChange={e => this.pageNumberChanged(e, +e.target.value)}
              onKeyDown={this.keyPress.bind(this)} ref={this.pageNumber} onClick={this.pageNumberClick} />
            <li className={"page-item page-item-arrow "} key={"next"} >
              <a className="page-link p-2" onClick={(e) => this.changePage(e, currentPageIndex + 1)}>
                <i className={"icon icon-14 ml-2 mr-1 mb-1 " + 
                  (currentPageIndex < pageCount ? "icon-keyboard-arrow-left" : "icon-keyboard-arrow-left-gray")}></i>
              </a>
            </li>
          </ul>
        </nav>
      );
    }
    else {
      if(pageCount > 6) {
        let isNotShownBtn = false;
        for (let i = 0; i < pageCount; i++) {
          if(i === 0 || (currentPageIndex - i <= 2 && currentPageIndex - i >= 0) || (i === pageCount - 1) || 
            (currentPageIndex <= 3 && i < 4) || (pageCount - currentPageIndex < 3 && i > pageCount-4 )) {
            if(isNotShownBtn) {
              isNotShownBtn = false;
              pages.push(<li className="page-item disabled" key={i+1000}><a className="page-link" >...</a></li>);
            }
            pages.push(<li className={"page-item " + (currentPageIndex === (i+1) ? "active": "")} key={i}>
              <a className="page-link" onClick={(e) => this.changePage(e, i+1)} >{i+1}</a>
            </li>);
          }
          else {
            isNotShownBtn = true;
          }
        }
      }
      else {
        for (let i = 0; i < pageCount; i++) {
          pages.push(
          <li className={"page-item " + (currentPageIndex === (i+1) ? "active": "")} key={i}>
            <a className="page-link" onClick={(e) => this.changePage(e, i+1)} >{i+1}</a>
          </li>);
        }
      }
      return (
        <nav className="d-flex justify-content-center p-0 mt-3 mx-auto ">
          <ul className="row pagination pr-0">
            <li className={"page-item page-item-arrow " + (currentPageIndex > 1 ? "": "disabled")} key={"prev"}>
              <a className="page-link" onClick={(e) => this.changePage(e, currentPageIndex - 1)}>
                <i className={"icon icon-14 item-arrow-right mb-1 " + 
                  ( currentPageIndex > 1 ? "icon-keyboard-arrow-right" : "icon-keyboard-arrow-right-gray")}></i>
              </a>
            </li>
            {pages}
            <li className={"page-item page-item-arrow " + (currentPageIndex < pageCount ? "": "disabled")} key={"next"}>
              <a className="page-link" onClick={(e) => this.changePage(e, currentPageIndex + 1)}>
                <i className={"icon icon-14 ml-2 mr-1 mb-1 " + 
                  (currentPageIndex < pageCount ? "icon-keyboard-arrow-left" : "icon-keyboard-arrow-left-gray")}></i>
              </a>
            </li>
          </ul>
        </nav>
      );
    }
    
  }

  render() {
    const { data, noDataMessage } = this.props;
    const { currentPageIndex, pageCount, pageSize } = this.state;
    let rows = this.createList();
    let footer = this.createFooter();
    return(
      <div className="pagination-container">
        <div className="pagination-content">
          {
            rows && rows.length > 0 ?
            rows
            : <div className="w-100 text-center py-4">{noDataMessage}</div>
          }
        </div>
        {/* <div className="pagination-"> */}
        {
          rows && rows.length > 0 && pageCount > 1 ?
          footer
          : null
        }
        {/* </div> */}
      </div>
    );
  }

}