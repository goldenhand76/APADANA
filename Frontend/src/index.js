import React from 'react';
import {createRoot} from 'react-dom/client';
import {createBrowserHistory} from "history";
import {isMobile,} from 'react-device-detect';
import {positions, Provider as AlertProvider} from 'react-alert';
import './utils/helper';
import App from './app';
import './assets/sass/app.scss';

const history = createBrowserHistory();

const options = {
    // you can also just use 'bottom center'
    position: (isMobile ? positions.BOTTOM_CENTER : positions.BOTTOM_LEFT),
    timeout: 5000,
    offset: '20px',
    containerStyle: {
        zIndex: 1060,
        background: "white",
        width: isMobile ? "330px" : "430px",
        right: "20px",
        bottom: "20px",
        borderRadius: "8px",
        boxShadow: "0 1px 8px rgba(56, 125, 248, 0.25)",
        display: "block"
    },
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

const AlertTemplate = ({style, options, message, close}) => (
    <div style={style} className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
            <i className={`icon icon-24 icon-alert-${options.type}`}/>
            <span className={`font-weight-bold mr-3 text-${options.type}`}>
                {message}
            </span>
        </div>
        <button onClick={close} className="border-0 bg-transparent"><i
            className="icon icon-24 icon-close-circle-white"/></button>
    </div>
)

const container = document.getElementById('root');
const root = createRoot(container);

const Root = () => (
    <AlertProvider template={AlertTemplate} {...options}>
        <App history={history}/>
    </AlertProvider>
)

root.render(<Root/>);
