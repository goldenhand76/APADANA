import React, {Suspense} from 'react';
import { Router, Route, Switch, Redirect, BrowserRouter } from "react-router-dom";
import {Provider} from 'react-redux';
import { withAlert } from 'react-alert';
import { store } from './redux/store';
import indexRoutes from "./routes";
import Loader from './components/Loader/Loader';
import TimeAgo from "javascript-time-ago";
import fa from "javascript-time-ago/locale/fa";
TimeAgo.addDefaultLocale(fa)

const App = ({alert, history}) => {

    window.alert = alert;
    return (
        <Provider store={store}>
            <BrowserRouter >
                <Suspense fallback={<Loader />}>
                    <Switch>
                        {indexRoutes.map((prop, key) => {
                            if (prop.redirect) {
                                return <Redirect from={prop.path} to={prop.to} key={key} />;
                            }
                            else
                                return <Route path={prop.path} component={prop.component} key={key} />;
                        })}
                    </Switch>
                </Suspense>
            </BrowserRouter>
        </Provider>
    )
}

export default withAlert()(App);