import React, { Component } from "react";
import { Link } from 'react-router-dom';
import moment from "moment-jalaali";
import Button from '../Button/Button';
import toosAbLogo from "../../assets/img/arm_toossab_F.png";


export default class PrintBillConfirm extends Component {

    constructor(props) {
        super(props);

        this.state = {
        };

        this.printPage = this.printPage.bind(this);
    }

    printPage() {
        window.print();
    }

    render() {
        const { data, address, document_number, printWithLogo } = this.props;
        const project = data[0]?.project ? data[0]?.project : null;
        let totalPrice = 0;
        let added_values = 0;
        let amounts = 0;
        const currentDate = moment().format('jYYYY/jMM/DD');
        for (let i = 0; i < data.length; i++) {
            totalPrice += (+data[i].amount + +data[i].added_value );
            added_values += +data[i].added_value;
            amounts += +data[i].amount;
        }
        const result = [];
        if(data.length > 0) {
            for (let i = 0; i < Math.ceil(data.length / 5); i++) {
                const newpageData = data.slice(i*5, (i+1)*5 > data.length ? data.length : (i+1)*5);
                result.push(
                    <div className="small print " id="print">
                        {
                            printWithLogo ?
                            <div className="d-flex justify-content-center ">
                                <img src={toosAbLogo} width={120} title="حذف " />
                            </div>
                            : null
                        }
                        <div>
                            <table className="print" cellspacing="0" border="0" style={{ margin: "0 auto", width: "100%" }}>
                                {/* <colgroup width="32"></colgroup>
                                <colgroup width="92"></colgroup>
                                <colgroup width="67"></colgroup>
                                <colgroup width="185"></colgroup>
                                <colgroup width="24"></colgroup>
                                <colgroup width="22"></colgroup>
                                <colgroup span="50" width="36"></colgroup>
                                <colgroup span="10" width="22"></colgroup>
                                <colgroup width="63"></colgroup>
                                <colgroup span="11" width="27"></colgroup>
                                <colgroup span="13" width="68"></colgroup> */}
                                <tbody width="100%">
                                    <tr>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td colspan="12" rowspan="3" align="center" align="middle"><b>
                                            <font face="B Titr" size="2"> صورتحساب فروش کالا و خدمات </font>
                                        </b></td>
                                        <td colspan="3" align="center" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        {/* <td colspan="4" align="center" align="middle">
                                            <font face="B Titr">شماره فاکتور :</font>
                                        </td> */}
                                        <td colspan="2" align="center" align="middle">
                                            <font face="B Titr"></font>
                                        </td>
                                        <td align="left" align="middle">
                                            <font face="Nazanin"><br /></font>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="center" align="middle">
                                        </td>
                                        <td align="center" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                            <br />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" align="left" align="middle">
                                            <font face="B Titr"> شماره سند: {document_number} </font>
                                        </td>
                                        {/* <td align="left" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td> */}
                                        <td align="left" align="middle">
                                        </td>
                                        <td colspan="2" align="center" align="middle">
                                        </td>
                                        <td align="left" align="middle">
                                        </td>
                                        {/* <td align="left" align="middle">
                                        </td> */}
                                        <td align="left" align="middle">
                                        </td>
                                        <td colspan="7" align="center" align="middle" className="text-left">
                                            <font face="B Titr"> تاریخ صدور : {moment(newpageData[0].confirmation_date).format('jYYYY/jMM/jDD')}</font>
                                        </td>
                                        <td colspan="2" align="center" align="middle">
                                            <font face="B Titr">{}</font>
                                        </td>
                                        <td align="left" align="middle">
                                            <font face="Nazanin"><br /></font>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="30" align="center" align="middle"><b>
                                            <font face="B Zar" size="3">مشخصات فروشنده</font>
                                        </b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "2px solid #000000" }} colspan="7" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;نام شخص حقيقي / حقوقي : {" طوس آب "}</font>
                                        </b></td>
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="10" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;شماره اقتصادی: 41191883341</font>
                                        </b></td>
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "2px solid #000000", borderRight: "1px solid #000000" }} colspan="13" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;شماره ثبت/شماره ملی: 3115/10380190168</font>
                                        </b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "2px solid #000000" }} colspan="3" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;استان:‌ خراسان رضوی</font>
                                        </b></td>
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="2" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;شهرستان: مشهد</font>
                                        </b></td>
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="10" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp; نشاني: مشهد، بلوار ارشاد، خيابان پيام، شماره 14
                                            </font>
                                        </b ></td >
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="5" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;کد پستی: ‌9185835566 </ font>
                                        </b></td >
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "2px solid #000000", borderRight: "1px solid #000000" }} colspan="10" align="right" align="middle" > <b>
                                            <font face="B Titr">&nbsp;شماره تلفن / نمابر: 6-37684091/37007000 (051) 98+</font>
                                        </b></td >
                                    </tr >
                                    <tr>
                                        <td colspan="30" align="center" align="middle"><b>
                                            <font face="B Zar" size="3">مشخصات خريدار</font>
                                        </b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "2px solid #000000" }} colspan="7" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;نام شخص حقيقي / حقوقي : {project?.employer?.first_name ? (project?.employer?.first_name + " " + project?.employer?.last_name) : project?.employer?.title}</font>
                                        </b></td>
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="10" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;شماره اقتصادی : {project?.employer?.economic_code || ""}</font>
                                        </b></td>
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "2px solid #000000", borderRight: "1px solid #000000" }} colspan="13" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;شماره ثبت/شماره ملی : {(project?.employer?.national_id || "") + (project?.employer?.register_number ? "/" + project?.employer?.register_number : "")}</font>
                                        </b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "2px solid #000000" }} colspan="3" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;استان:‌ {address?.province?.title}</font>
                                        </b></td>
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="2" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp;شهرستان: {address?.city?.title}</font>
                                        </b></td>
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="10" align="right" align="middle"><b>
                                            <font face="B Titr">
                                                &nbsp;نشاني: <b>{address?.address} </b>
                                            </font>
                                        </b ></td >
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="5" align="right" align="middle"><b>
                                            <font face="B Titr">&nbsp; کد پستی : ‌ {address?.postal_code || ""}</ font>
                                        </b></td >
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "2px solid #000000", borderRight: "1px solid #000000" }} colspan="10" align="right" align="middle" > <b>
                                            <font face="B Titr">&nbsp;شماره تلفن / نمابر: {(address?.contact_number || project?.employer?.tel || "") + (project?.employer?.fax ? "/" + project?.employer?.fax : "")}</font>
                                        </b></td >
                                    </tr >
                                    <tr>
                                        <td colspan="30" align="center" align="middle"><b>
                                            <font face="B Titr" size="3">مشخصات كالا</font>
                                        </b></td>
                                    </tr>
                                    <tr>
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "2px solid #000000" }} colspan="1" align="center" align="middle">
                                            <font face="B Titr">کد پروژه</font>
                                        </td>
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="4" align="center" align="middle" >
                                            <font face="B Titr">شرح كالا يا خدمت</font>
                                        </td >
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="1" align="center" align="middle" >
                                            <font face="B Titr">تعداد مقدار</font>
                                        </td >
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="4" align="center" align="middle" >
                                            <font face="B Titr">واحد اندازه گیری</font>
                                        </td >
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="3" align="center" align="middle" >
                                            <font face="B Titr">مبلغ واحد</font>
                                        </td >
                                        {/* <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="2" align="center" align="middle" >
                                            <font face="B Titr">فی واحد </font>
                                        </td > */}
                                        {/* <td style={{
                                            borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                        }
                                        } colspan="2" align="center" align="middle" >
                                            <font face="B Titr">فی هر بسته</font>
                                        </td > */}
                                        <td style={{
                                            borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                        }
                                        } colspan="3" align="center" align="middle" >
                                            <font face="B Titr">مبلغ كل </font>
                                        </td >
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="2" align="center" align="middle">
                                            <font face="B Titr" > مبلغ تخفيف</font>
                                        </td >
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="3" align="center" align="middle">
                                            <font face="B Titr" > مبلغ کل پس از تخفیف</font>
                                        </td >
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="3" align="center" align="middle" >
                                            <font face="B Titr">جمع ماليات و عوارض</font>
                                        </td >
                                        <td style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000", borderLeft: "2px solid #000000", borderRight: "1px solid #000000" }} colspan="6" align="center" align="middle" >
                                            <font face="B Titr">جمع مبلغ كل بعلاوه جمع ماليات و عوارض</font>
                                        </td >
                                    </tr>
                                    {
                                        newpageData.map((item, i) => {
                                            return (
                                                <tr>
                                                    <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "2px solid #000000" }} colspan="1"  align="center" align="middle" sdval="1" sdnum="1033;0;#,##0">
                                                        <font face="B Titr" size="1">{item?.project?.code}</font>
                                                    </td>
                                                    <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="4" align="center" align="middle" >
                                                        <font face="B Titr" size="1">{` ${(item?.project?.contract_number ? item?.project?.contract_number : "") + " صورت حساب "+ item?.bill?.bill_type?.title}`}<br /></font>
                                                    </td >
                                                    <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="1" align="center" align="middle" sdnum="1033;0;#,##0" >
                                                        <font face="B Titr" size="1">{"-"}<br /></font>
                                                    </td >
                                                    <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="4" align="center" align="middle" sdnum="1033;0;#,##0" >
                                                        <font face="B Titr" size="1">{""}<br /></font>
                                                    </td >
                                                    <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="3" align="center" align="middle" sdnum="1033;0;#,##0" >
                                                        <font face="B Titr" size="1">{(+item.amount).toLocaleString()}<br /></font>
                                                    </td >
                                                    <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="3" align="center" align="middle" sdnum="1033;0;#,##0" >
                                                        <font face="B Titr" size="1">{(+item.amount).toLocaleString()}<br /></font>
                                                    </td >
                                                    <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="2" align="center" align="middle" sdnum="1033;0;#,##0" >
                                                        <font face="B Titr" size="1">{"0"}<br /></font>
                                                    </td >
                                                    <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000" }} colspan="3" align="center" align="middle" sdval="0" sdnum="1033;0;#,##0" >
                                                        <font face="B Titr" size="1">{(+item.amount).toLocaleString()}</font>
                                                    </td >
                                                    <td style={{
                                                        borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                                    }} colspan="3" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" >
                                                        < font face="B Titr" size="1" >{(+item.added_value).toLocaleString()}</font>
                                                    </td >
                                                    <td style={{
                                                        borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                                    }} colspan="6" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" >
                                                        < font face="B Titr" size="1" >{(+item.added_value + +item.amount).toLocaleString()}</font>
                                                    </td >
                                                    {/* <td style={{
                                                        borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "2px solid #000000", borderRight: "1px solid #000000"
                                                    }} colspan="10" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" >
                                                        < font face="B Titr" size="1" >{"    "}</font>
                                                    </td > */}
                                                </tr >
                                            )
                                        })
                                    }

                                    <tr>
                                        <td style={{ borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "2px solid #000000" }} colspan="10" align="center" align="middle" >
                                            <font face="B Titr">جمع کل</font>
                                        </td>
                                        <td style={{borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                        }} colspan="3" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" >
                                            <font face="B Titr" > {amounts.toLocaleString()}</font>
                                        </td >
                                        <td style={{
                                            borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                        }} colspan="3" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" >
                                            < font face="B Titr" > {amounts.toLocaleString()}</font>
                                        </td >
                                        <td style={{
                                            borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                        }} colspan="2" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" >
                                            < font face="B Titr" >0</font>
                                        </td >
                                        <td style={{
                                            borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                        }} colspan="3" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" >
                                            < font face="B Titr" >{amounts.toLocaleString()} </font>
                                        </td >
                                        <td style={{
                                            borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "1px solid #000000", borderRight: "1px solid #000000"
                                        }} colspan="3" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" >
                                            < font face="B Titr" >{added_values.toLocaleString()}</font>
                                        </td >
                                        <td style={{
                                            borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "2px solid #000000", borderRight: "1px solid #000000"
                                        }} colspan="6" align="center" align="middle" sdval="0" sdnum="1033; 0;#,##0" > <b>
                                                < font face="B Titr" >{totalPrice.toLocaleString()} </font>
                                            </b ></td >
                                    </tr >
                                    <tr>
                                        <td style={{
                                            borderTop: "1px solid #000000", borderBottom: "1px solid #000000", borderLeft: "2px solid #000000", borderRight: "2px solid #000000"
                                        }} colspan="30" height="60" align="right" align="middle" >
                                            <font face="B Titr">توضيحات مشتری:
                                                < br />
                                                <br />
                                    پاسخ:
                                            </font>
                                        </td >
                                    </tr >
                                    <tr>
                                        <td style={{
                                            borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "1px solid #000000", borderRight: "2px solid #000000"
                                        }} colspan="4" height="64" align="center" align="middle" >
                                            <font face="B Titr" size="2">مهر و امضاء فروشنده </font>
                                        </td>
                                        <td style={{
                                            borderTop: "1px solid #000000", borderBottom: "2px solid #000000", borderLeft: "2px solid #000000", borderRight: "1px solid #000000"
                                        }} colspan="26" align="center" align="middle" >
                                            < font face="B Titr" size="2" > مهر و امضاء خريدار</font>
                                        </td >
                                    </ tr >

                                    {/* <tr>
                            <td colspan="50">
                                <br /><br /><br />
                                <center>قدرت گرفته از آیمیس - سامانه یکپارچه مدیریت کسب و کار عصر نقره ای</center>
                            </td>

                        </tr> */}
                                </tbody >
                            </table >
                            <div className="py-3 d-flex justify-content-center ">
                                <Button isLoading={this.state.btnIsLoading} className="btn no-print" id="printButton"
                                    type={"btn-green-outline"} onClick={() => this.printPage()}>
                                    <div className="pr-2">پرینت</div>
                                </Button>
                            </div>
                        </div>
                    </div>);
            }
            return (
                <div>{result}</div>
            );
        }
        else {
            return <div></div>
        }
    }
};