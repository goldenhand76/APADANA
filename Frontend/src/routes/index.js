import { lazy } from 'react';
const Main = lazy(() => import('../layouts/Main/Main'));
const Login = lazy(() => import('../views/Login/Login'));
const ForgetPassword = lazy(() => import("../views/Login/ForgetPassword"))

const indexRoutes = [
    // { path: "/Users", component: Main },
    { path: "/Panel/Dashboard", component: Main },
    // { path: "/Panel/Login", component: Login },
    { path: "/Panel/ForgetPassword/:uid/:token", component: ForgetPassword },
    { path: "/", component: Login },
    { path: "/Panel/Login", component: Login },
    { redirect: true, path: "/Panel", to: "/Panel/Dashboard", navbarName: "Redirect" }
];

export default indexRoutes;