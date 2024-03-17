
import React, { Component } from 'react';
import moment from "moment-jalaali";
import { DatePicker } from "react-persian-datepicker";
import { isMobile } from 'react-device-detect';

const styles = {
    calendarContainer: 'calendarContainer',
    dayPickerContainer: 'dayPickerContainer',
    monthsList: 'monthsList',
    daysOfWeek: 'daysOfWeek',
    dayWrapper: 'dayWrapper',
    selected: 'selected',
    heading: 'heading',
    prev: 'prev',
    next: 'next',
    title: 'title'
}
let field = document.createElement('input');
field.setAttribute('type', 'text');
export default class PersianDatePicker extends Component {

    constructor(props) {
        super(props);

        this.state = {};

        this.scroll = this.scroll.bind(this);
    }

    componentDidMount(){
        if(!this.refs.datepicker.refs.input.readOnly) {
            this.refs.datepicker.refs.input.readOnly = true;
            this.refs.datepicker.refs.input.style.backgroundColor = "unset";
        }

        this.refs.datepicker.refs.input.addEventListener("focus", this.scroll);
    }

    componentWillUnmount() {
        this.refs.datepicker.refs.input.removeEventListener("focus", this.scroll.bind(this));
    }

    handleChange(value) {
        this.props.onChange(value);
        this.refs.datepicker.state.isOpen = false;
    }

    scroll() {
        if(isMobile) {
            this.refs.datepicker.refs.input.scrollIntoView();
        }
    }

    render() {
        const date = new Date();
        date.setDate(date.getDate() - 1);

        return(
            <DatePicker
                ref="datepicker"
                calendarStyles={styles}
                inputFormat="jYYYY/jM/jD"
                // min={this.props.min || date.toISOString().split("T")[0].split("-")}
                min={this.props.min || date}
                closeOnSelect={true}
                // className="calendar-Container p-2 text-left"
                onChange={this.handleChange.bind(this)}
                value={this.props.value}
                className={this.props.className}
            />
        )
    }
}