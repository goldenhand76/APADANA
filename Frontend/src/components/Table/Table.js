import React, { Component } from "react";
import Button from "../Button/Button";

const noDataMessage = "داده ای برای نمایش موجود نمی باشد";
let numChangedTimeout = null;
export default class Table extends Component {

  constructor(props) {
    super(props);
    this.pageNumber = React.createRef();

    this.state = {
      pageSize: this.props.pageSize || 2,
      data: this.props.data || [],
      columns: this.props.columns || [],
      pageCount: 0,
      currentPageIndex: 1,
      apiLoadFunction: this.props.apiLoadFunction,
      count: 0,
      isLoading: true,
      page: 1,
      head: [],
      rows: [],
      pages: [],
      retryData: false,
      // refresh: this.props.refresh,
      headerSortable: null,
      headerSortableAsc: null,
      isMobile: false,
      // pageValue: 1
    };
    this.refresh = this.refresh.bind(this);
  }

  refresh() {
    this.loadData();
  }

  componentDidMount() {
    if (this.props.apiLoadFunction)
      this.loadData();
    else
      this.createTable();

    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  resize() {
    const deviceType = this.findBootstrapEnvironment();
    if (deviceType === "xs" || deviceType === "sm") {
      this.state.isMobile = true;
    }
    else {
      this.state.isMobile = false;
    }
    if (!this.state.isLoading) {
      this.createFooter();
      this.createTableRows();
    }
  }

  componentDidUpdate(state, props) {
    // console.log("state", state, props, this.props);
    const { apiLoadFunction } = this.props;
    if (this.props.refresh) {
      // this.props.refresh = false;
      // this.state.data = this.props.data;
      this.loadData();
      return;
    }

    if (this.props.apiLoadFunction !== state.apiLoadFunction) { // new update
      this.loadData();
      return;
    }

    if (state.filter !== this.props.filter) {
      this.loadData();
      return;
    }

    if (apiLoadFunction || (props.data === this.props.data && state.data === this.state.data)) return;
    if (this.props.data)
      this.state.data = this.props.data;
    else return;
    this.createTable();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize.bind(this));
  }

  loadData() {
    const { apiLoadFunction, apiLoadDataParam, orderBy, filter } = this.props;
    const { headerSortable, headerSortableAsc } = this.state;
    const param = { page: this.state.page, count: this.state.pageSize };
    if (headerSortable) {
      // param.key = headerSortable;
      // param.type = headerSortableAsc ? "asc" : "desc";
      if(!param?.filters) {
        param.filters = {};
      }
      const sort = {
        key: headerSortable,
        checked: 1,
        sort: headerSortableAsc ? "asc" : "desc"
      }
      // param.sort = sort;

      param.sort = {
        key: headerSortable,
        checked: 1,
        sort: headerSortableAsc ? "asc" : "desc"
      }
    }
    else if (orderBy) {
      param.key = orderBy[orderBy.length - 1].name;
      param.type = orderBy[orderBy.length - 1].asc ? "asc" : "desc";
    }
    if (filter) {
      param.filter = filter;
    }
    this.setState({
      isLoading: true
    });
    apiLoadFunction(param, apiLoadDataParam).then((res) => {
      this.state.data = res.data;
      this.state.count = res.total;
      // if(this.state.head.length < 1)
      this.createTable();
      // else {
      // this.createFooter();
      // this.createTableRows();
      // }
    }).catch((err) => {
      this.setState({
        isLoading: false,
        retryData: true
      });
    });
  }

  createHeader() {
    this.state.head = [];
    const { rowIndexDisabled, mobileListTemplate } = this.props;
    const { isMobile } = this.state;

    if (isMobile && mobileListTemplate) {
      this.state.head = [];
      return;
    }
    if (!rowIndexDisabled)
      this.state.head.push(<th key="index">ردیف</th>);
    for (const key in this.props.columns) {
      if (this.props.columns.hasOwnProperty(key)) {
        if (this.props.columns[key].element) {
          this.state.head.push(
              <th key={key} onClick={() => this.headerClick(key)} className={"header-column position-relative " + (this.props.headerSortable ? "header-sortable " : "") + (this.state.headerSortable === key ? ((this.state.headerSortableAsc ? "header-sortable-asc" : "header-sortable-des")) : "")}>
                {this.props.columns[key].title}
                <div className="eliminate-btn icon icon-14 icon-dialog-close-muted position-absolute " onClick={() => this.eliminateColumn(key)}></div>
              </th>);
        }
        else if (this.props.columns[key].actions) {
          this.state.head.push(<th className="header-column " key={key}>{this.props.columns[key].title}</th>);
        }
        else {
          this.state.head.push(
              <th key={key} onClick={() => this.headerClick(key)} className={"header-column position-relative " + (this.props.headerSortable ? "header-sortable " : "") + (this.state.headerSortable === key ? ((this.state.headerSortableAsc ? "header-sortable-asc" : "header-sortable-des")) : "")}>
                {this.props.columns[key]}
                <div className="eliminate-btn icon icon-14 icon-dialog-close-muted position-absolute " onClick={() => this.eliminateColumn(key)}></div>
              </th>);
        }
      }
    }
  }

  createFooter() {
    const { apiLoadFunction, mobileListTemplate } = this.props;
    const { isMobile } = this.state;
    if(this.state.page > this.state.pageCount) {
      this.state.page = 1;
      this.state.currentPageIndex = 1;
    }
    this.state.pages = [];
    const pages = [];
    if (this.props.footer === false) return;
    if (apiLoadFunction)
      this.state.pageCount = Math.ceil(this.state.count / this.state.pageSize);
    else
      this.state.pageCount = Math.ceil(this.state.data.length / this.state.pageSize);

    if (this.state.pageCount > 6) {
      let isNotShownBtn = false;
      for (let i = 0; i < this.state.pageCount; i++) {
        if (i === 0 || (this.state.currentPageIndex - i <= 2 && this.state.currentPageIndex - i >= 0) || (i === this.state.pageCount - 1) || (this.state.currentPageIndex <= 3 && i < 4) || (this.state.pageCount - this.state.currentPageIndex < 3 && i > this.state.pageCount - 4)) {
          if (isNotShownBtn) {
            isNotShownBtn = false;
            pages.push(<li className="page-item disabled" key={i - 1}><a className="page-link" >...</a></li>);
          }
          pages.push(<li className={"page-item " + (this.state.currentPageIndex === (i + 1) ? "active" : "")} key={i}><a className="page-link" onClick={(e) => this.changePage(e, i + 1)} >{i + 1}</a></li>);
        }
        else {
          isNotShownBtn = true;
        }
      }
    }
    else {
      for (let i = 0; i < this.state.pageCount; i++) {
        pages.push(<li className={"page-item " + (this.state.currentPageIndex === (i + 1) ? "active" : "")} key={i}><a className="page-link" onClick={(e) => this.changePage(e, i + 1)} >{i + 1}</a></li>);
      }
    }

    if (isMobile && mobileListTemplate) {
      this.state.pages.push(<li className={"page-item " + (this.state.currentPageIndex > 1 ? "" : "disabled")} key={"prev"}><a className="page-link p-2" onClick={(e) => this.changePage(e, this.state.currentPageIndex - 1)}><i className="icon icon-14 icon-keyboard-arrow-right item-arrow-right mb-1"></i></a></li>);
      const pager = <input className="px-2 text-center" value={this.state.currentPageIndex} type="number" min="1" max={this.state.pageCount} maxLength="3" onChange={e => this.pageNumberChanged(e, +e.target.value)} onKeyDown={this.keyPress.bind(this)} ref={this.pageNumber} onClick={this.pageNumberClick.bind(this)} />;
      this.state.pages.push(pager);
      this.state.pages.push(<li className={"page-item "} key={"next"}><a className="page-link p-2" onClick={(e) => this.changePage(e, this.state.currentPageIndex + 1)}><i className="icon icon-14 ml-2 icon-keyboard-arrow-left mr-1 mb-1
      "></i></a></li>);
    }
    else {
      this.state.pages.push(<li className={"page-item " + (this.state.currentPageIndex > 1 ? "" : "disabled")} key={"prev"}><a className="page-link" onClick={(e) => this.changePage(e, this.state.currentPageIndex - 1)}><i className="icon icon-14 icon-keyboard-arrow-right item-arrow-right mb-1"></i></a></li>);
      this.state.pages.push(pages);
      this.state.pages.push(<li className={"page-item " + (this.state.currentPageIndex < this.state.pageCount ? "" : "disabled")} key={"next"}><a className="page-link" onClick={(e) => this.changePage(e, this.state.currentPageIndex + 1)}><i className="icon icon-14 ml-2 icon-keyboard-arrow-left mr-1 mb-1"></i></a></li>);
    }
  }

  createTableRows() {
    const { rowClick, apiLoadFunction, orderBy, rowIndexDisabled, mobileListTemplate, rowElement } = this.props;
    const { headerSortable, headerSortableAsc, isMobile } = this.state;
    if(this.state.page > this.state.pageCount) {
      this.state.page = 1;
      this.state.currentPageIndex = 1;
    }

    if (orderBy && !apiLoadFunction)
      this.state.data = this.sortData(this.state.data, orderBy);
    if (headerSortable && !apiLoadFunction)
      this.state.data = this.sortData(this.state.data, headerSortable, headerSortableAsc);
    this.state.rows = [];
    let tableRows = [];
    try {
      let index = (this.state.currentPageIndex - 1) * this.state.pageSize;
      let i = index;
      if (apiLoadFunction)
        i = 0;
      for (; i < this.state.data.length && tableRows.length !== (this.state.pageSize);) {
        const rowData = this.state.data[i];
        const row = [];
        ++index;
        ++i;
        if (isMobile && mobileListTemplate) {
          tableRows.push(<div className="card card-box"  onClick={() => this.rowClick(rowData)} key={index}>{mobileListTemplate(rowData)}</div>);
        }
        else {
          if (!rowIndexDisabled)
            row.push(<td key={index}>{index}</td>);
          for (const key in this.props.columns) {
            if (this.props.columns[key].element) {
              row.push(<td onClick={() => this.rowClick(rowData)} key={key + index}>{this.props.columns[key].element(rowData)}</td>)
            }
            else if (this.props.columns[key].actions) {
              row.push(<td key={key + index}>{this.props.columns[key].actions(rowData)}</td>)
            }
            else {
              if (rowData.hasOwnProperty(key)) {
                row.push(<td onClick={() => this.rowClick(rowData)} key={key}>{rowData[key]}</td>);
              }
              else
                row.push(<td onClick={() => this.rowClick(rowData)} key={key}></td>);
            }
          }
          if (rowElement)
            tableRows.push(rowElement(row, rowData, rowClick ? "row-pointer" : "", index));
          else
            tableRows.push(<tr className={rowClick ? "row-pointer" : ""} key={index} >{row}</tr>);
        }
      }
      this.setState({
        rows: tableRows,
        isLoading: false
      });
    } catch (error) {
      this.setState({
        rows: tableRows,
        isLoading: false
      });
    }
  }

  rowClick(rowData) {
    const { rowClick } = this.props;
    if (rowClick)
      rowClick(rowData);
  }

  headerClick(key) {
    const { headerSortable, apiLoadFunction } = this.props;
    if (headerSortable) {
      // this.setState((state) => ({
      //   headerSortable: key,
      //   headerSortableAsc: !state.headerSortableAsc,
      // }));
      if (apiLoadFunction) {
        this.state.headerSortable = key;
        this.state.headerSortableAsc = !this.state.headerSortableAsc;
        this.loadData();
      }
      else {
        this.state.headerSortable = key;
        this.state.headerSortableAsc = !this.state.headerSortableAsc;
        this.createTable();
      }
    }
  }

  eliminateColumn(key) {
    const { headerSortable, apiLoadFunction } = this.props;
    delete this.props.columns[key];
    this.createTable();
  }

  createTable() {
    this.createHeader();
    this.createFooter();
    this.createTableRows();
  }

  keyPress(e) {
    if (e.keyCode == 13) {
      this.changePage(e, this.state.currentPageIndex);
    }
  }

  pageNumberClick(e) {
    this.pageNumber.current.select();
  }

  pageNumberChanged(e, pageNumber) {
    const { pageCount } = this.state;
    if (pageNumber <= pageCount) {
      this.setState({ currentPageIndex: pageNumber });
    }
  }

  changePage(e, pageNumber) {
    if (e.preventDefault)
      e.preventDefault();
    const { apiLoadFunction } = this.props;
    const { pageCount } = this.state;
    if (pageNumber > 0 && pageNumber <= pageCount) {
      // if(this.state.currentPageIndex !== +pageNumber) {
      this.state.currentPageIndex = +pageNumber;
      // this.state.offset = (this.state.currentPageIndex - 1) * this.state.pageSize;
      this.state.page = this.state.currentPageIndex;
      if (apiLoadFunction) {
        this.setState({
          isLoading: true
        });
        this.loadData();
      }
      else {
        // this.createFooter();
        this.createTableRows();
      }
      // }
    }
    else
      return;
  }

  sortData(dataList, orderBy, asc) {
    if (typeof orderBy === "object" || typeof orderBy === "string")
      orderBy = [orderBy];
    console.log("sortData", dataList, orderBy, asc, typeof orderBy);
    let result = [];
    result = dataList;
    for (let i = orderBy.length - 1; i >= 0; i--) {
      result = dataList.sort((a, b) => (a[orderBy[i].name || orderBy[i]] > b[orderBy[i].name || orderBy[i]]) ? 1 : ((b[orderBy[i].name || orderBy[i]] > a[orderBy[i].name || orderBy[i]]) ? -1 : 0));
      console.log("result", result, typeof orderBy[i] === "object" && !orderBy[i].asc, asc === false);
      if (typeof orderBy[i] === "object" && !orderBy[i].asc)
        result.reverse();
      if (asc === false)
        result.reverse();
    }
    return result;
  }

  compare(a, b) {
    if (a[key] < b[key])
      return -1;
    if (a[key] > b[key])
      return 1;
    return 0;
  }

  findBootstrapEnvironment() {
    let envs = ['xs', 'sm', 'md', 'lg', 'xl'];

    let el = document.createElement('div');
    document.body.appendChild(el);

    let curEnv = envs.shift();

    for (let env of envs.reverse()) {
      el.classList.add(`d-${env}-none`);

      if (window.getComputedStyle(el).display === 'none') {
        curEnv = env;
        break;
      }
    }

    document.body.removeChild(el);
    return curEnv;
  }

  render() {
    this.createFooter();
    const { mobileListTemplate, tableClassName, containerClassName } = this.props;
    const { isMobile, retryData } = this.state;
    if (retryData) {
      return (
          <div className="table-holder d-flex flex-column w-100 justify-content-center text-center">
            {/* <div onClick={() => { this.setState({isLoading: true, retryData: false}); this.loadData()} } className="table-retry-button">تلاش مجدد <i className="icon icon-20 icon-reload"></i></div>       */}
            <Button className="mx-auto mt-3 mb-3" type={"retry"} onClick={() => { this.setState({ isLoading: true, retryData: false }); this.loadData(); }}>
              <div className="table-retry-button">تلاش مجدد</div>
            </Button>
          </div>
      );
    }
    if (isMobile && mobileListTemplate) { // list view for mobile devices
      return (
          <div className="table-holder w-100">
            {
              (this.state.rows) ?
                  this.state.rows.length && !this.state.isLoading ? this.state.rows : null
                  :
                  <div className="table-loading"></div>
            }
            {this.state.rows[0] || this.state.isLoading ? null : <div className="text-center p-3">{this.props.noDataMessage || noDataMessage}</div>}
            {
              this.state.pages.length > 1 && this.state.pageCount > 1 ?
                  <nav className="d-flex justify-content-center p-0 mt-3 mx-auto">
                    <ul className="row pagination pr-0">
                      {this.state.pages}
                    </ul>
                  </nav>
                  : null
            }
          </div>
      );
    }
    return (
        <div className={"table-holder d-flex flex-column w-100 " + (this.state.isLoading ? "is-loading" : "")}>
          {
            (this.state.rows) ?
                <div className={"table-responsive " + containerClassName}>
                  <table className={"table " + tableClassName} cellPadding="0" cellSpacing="0">
                    {
                      !this.props.headerHide ?
                          <thead>
                          <tr>
                            {this.state.rows.length > 0 ? this.state.head : null}
                          </tr>
                          </thead>
                          : null
                    }
                    <tbody className="table-tbody">
                    {this.state.rows.length > 0 && !this.state.isLoading ? this.state.rows : null}
                    </tbody>
                    {/* <tfoot id="pageFooter">
                    <div >Page</div>
                </tfoot> */}
                  </table>
                  {this.state.rows[0] || this.state.isLoading ? null : <div className="text-center p-3 my-3">{this.props.noDataMessage || noDataMessage}</div>}
                  {
                    this.state.pages.length > 1 && this.state.pages[1].length > 1 ?
                        <nav>
                          <ul className="pagination justify-content-center">
                            {this.state.pages}
                          </ul>
                        </nav>
                        : null
                  }
                  {(this.state.isLoading) ? <div className="table-loading mx-3"/> : null}
                </div>
                :
                <div className="table-loading mx-2"/>
          }
        </div>);
  }
};