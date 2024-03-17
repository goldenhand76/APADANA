import {lazy} from 'react';

const Dashboard = lazy(() => import('../views/Dashboard/Dashboard'));
const Settings = lazy(() => import('../views/Settings/Settings'));
const Control = lazy(() => import('../views/Control/Control'));
const HistoryData = lazy(() => import('../views/HistoryData/HistoryData'));
const UserList = lazy(() => import('../views/User/List'));
const UserAction = lazy(() => import('../views/User/Action'));
const Me = lazy(() => import('../views/User/Me'));
const AddNewTile = lazy(() => import('../views/Dashboard/AddNewTile'))

const ActuatorManual = lazy(() => import('../views/Control/ActuatorManual'));
const ActuatorAutomatic = lazy(() => import('../views/Control/ActuatorAutomatic'));
const DevicesList = lazy(() => import('../views/Settings/DevicesList'));
const NotificationManagement = lazy(() => import('../views/Settings/NotificationManagement'));
// import UserNew from "../views/User/Store";

const mainRoutes = [
    {
        key: 0,
        path: "/Panel/Dashboard/Dashboard",
        title: "میزکار",
        sidebarName: "میزکار",
        pageCategory: 'Dashboard',
        iconClass: 'icon-dashboard',
        component: Dashboard,
        bottomNavigation: true,
    },
    {
        key: 1,
        path: "/Panel/Dashboard/Control",
        title: "اتوماسیون",
        sidebarName: "اتوماسیون",
        pageCategory: 'Dashboard',
        iconClass: 'icon-control',
        component: Control,
        bottomNavigation: true,
        showHeader: false,
        headerOptions: {},
        canControl: true,
    },
    {
        key: 2,
        path: "/Panel/Dashboard/HistoryData",
        title: "تاریخچه داده‌ها",
        sidebarName: "تاریخچه داده‌ها",
        pageCategory: 'Dashboard',
        iconClass: 'icon-history',
        component: HistoryData,
        bottomNavigation: true,
        showHeader: false,
        headerOptions: {},
    },
    {
        key: 3,
        path: "/Panel/Dashboard/User/List",
        sidebarName: "مدیریت کاربران",
        title: "مدیریت کاربران",
        pageCategory: "Dashboard",
        iconClass: "icon-user",
        component: UserList,
        bottomNavigation: true,
        showHeader: false,
        canControl: true,
    },
    {
        key: 4,
        path: "/Panel/Dashboard/Settings",
        title: "تنظیمات",
        sidebarName: "تنظیمات",
        pageCategory: 'Dashboard',
        iconClass: 'icon-setting',
        component: Settings,
        bottomNavigation: true,
        showHeader: false,
        headerOptions: {},
    },
    {
        title: "مدیریت دستگاه ها",
        path: "/Panel/Dashboard/Settings/DeviceManagement",
        pageCategory: "Dashboard",
        component: DevicesList,
        headerAction: "مدیریت دستگاه ها",
        canControl: true,
    },
    {
        title: "ویرایش کاربر",
        path: "/Panel/Dashboard/User/Action/:id",
        param: "id",
        pageCategory: "Dashboard",
        component: UserAction,
        headerAction: "ویرایش کاربر",
        canControl: true,
    },
    {
        path: "/Panel/Dashboard/User/Action",
        title: "ایجاد کاربر",
        pageCategory: "Dashboard",
        component: UserAction,
        headerAction: "ایجاد کاربر جدید",
        canControl: true,
    },
    {
        path: "/Panel/Dashboard/User/Me",
        title: "ویرایش پروفایل کاربری",
        pageCategory: "Dashboard",
        component: Me,
        headerAction: "ویرایش پروفایل کاربری",
    },
    {
        path: "/Panel/Dashboard/AddNewTile",
        title: "افزودن کارت جدید",
        pageCategory: 'Dashboard',
        iconClass: 'icon-dashboard',
        component: AddNewTile,
        headerAction: "افزودن کارت جدید",
    },
    {
        path: "/Panel/Dashboard/AddNewTile/:id",
        title: "ویرایش کارت",
        pageCategory: 'Dashboard',
        iconClass: 'icon-dashboard',
        component: AddNewTile,
        headerAction: "ویرایش کارت",
    },
    {
        path: "/Panel/Dashboard/Control/AddActuatorManual/:id",
        title: "اتوماسیون دستی",
        pageCategory: "Control",
        component: ActuatorManual,
        headerAction: "اتوماسیون دستی",
        canControl: true,
    },
    {
        path: "/Panel/Dashboard/Settings/NotificationManagement/:id",
        title: "مدیریت هشدار",
        pageCategory: "Settings",
        component: NotificationManagement,
        headerAction: "مدیریت هشدار",
        canControl: true,
    },
    {
        path: "/Panel/Dashboard/Settings/NotificationManagement",
        title: "مدیریت هشدار",
        pageCategory: "Settings",
        component: NotificationManagement,
        headerAction: "مدیریت هشدار",
        canControl: true,
    },
    {
        path: "/Panel/Dashboard/Control/AddActuatorManual",
        title: "اتوماسیون دستی",
        pageCategory: "Control",
        component: ActuatorManual,
        headerAction: "اتوماسیون دستی",
        canControl: true,
    },
    {
        path: "/Panel/Dashboard/Control/AddActuatorAutomatic/:id",
        title: "اتوماسیون اتوماتیک",
        pageCategory: "Control",
        component: ActuatorAutomatic,
        headerAction: "اتوماسیون اتوماتیک",
        canControl: true,
    },
    {
        path: "/Panel/Dashboard/Control/AddActuatorAutomatic",
        title: "اتوماسیون اتوماتیک",
        pageCategory: "Control",
        component: ActuatorAutomatic,
        headerAction: "اتوماسیون اتوماتیک",
        canControl: true,
    },
    {redirect: true, path: "/Panel", to: "/Panel/Dashboard/Dashboard", navbarName: "Redirect"}
];

export default mainRoutes;