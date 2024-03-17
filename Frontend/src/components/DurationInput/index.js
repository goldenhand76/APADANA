import React, { useState, useEffect, useRef, useCallback } from "react";
import "./style/style.scss";

const DurationInput = ({className, value, onChange, disabled, noTimeDurationLimit, numberOfDigitLimit = 2 }) => {

  const [timeHours, setTimeHours] = useState(value?.split(":")?.[0] || "");
  const [timeMinutes, setTimeMinutes] = useState(value?.split(":")?.[1] || "");
  const hoursInput = useRef(null);
  const minutesInput = useRef(null);

  useEffect(() => {
    setTimeHours(value?.split(":")?.[0] || "");
    setTimeMinutes(value?.split(":")?.[1] !== "0" ? value?.split(":")?.[1] : "00" || "");
  }, [value]);

  useEffect(() => {
    let time = null;
    if(timeHours || timeMinutes) {
      time = `${timeHours || "0"}:${timeMinutes || "0"}`;
    }
    onChange && onChange(time);
  }, [timeHours, timeMinutes]);

  useEffect(() => {
    if(timeHours === "0") {
      // hoursInput.current.select();
    }
  }, [timeHours]);

  useEffect(() => {
    if(timeMinutes === "0") {
      minutesInput.current.select();
    }
  }, [timeMinutes]);

  const hoursChanged = useCallback((e) => {
    const value = e?.target?.value;
    window.abas = 3;
    if((/^(2[0-3]|[0-1]?[\d])$/.test(value)) || noTimeDurationLimit) {
      setTimeHours(value);
      (value.toString().length === 2 && !noTimeDurationLimit) && minutesInput.current.select();
    }
    else {
      setTimeHours("00");
    }
  }, [timeHours]);

  const minutesChanged = useCallback((e) => {
    const value = e?.target?.value;
    if(/^(2[0-9]|[0-5]?[\d])$/.test(value)) {
      setTimeMinutes(value);
    }
    else {
      setTimeMinutes("00");
      minutesInput.current.select();
    }
  }, [timeMinutes]);

  const handleFocus = (event) => event.target.select();

  return (
      <div
          className={"duration-input-holder d-flex border py-1 px-1 align-items-center bg-white "
              + (noTimeDurationLimit ? "time-duration-large " : "")
              + (disabled ? "disabled" : "") + " "
              +  (className || "")
          }>
        <div className="">
          <input
              className="text-center"
              name="hours"
              type="number"
              min="0"
              max="24"
              value={timeHours}
              onFocus={handleFocus}
              ref={hoursInput}
              disabled={disabled && true}
              // onKeyUp={onKeyUp}
              onChange={hoursChanged} />
        </div>
        <div className="">:</div>
        <div className="">
          <input
              className="text-center mr-1"
              name="minutes"
              type="number"
              min="0"
              max="60"
              value={timeMinutes || ""}
              onFocus={handleFocus}
              ref={minutesInput}
              disabled={disabled && true}
              onChange={minutesChanged} />
        </div>
        {!disabled && <div className="icon icon-24 icon-time"></div>}
      </div>
  );
};

export default DurationInput;