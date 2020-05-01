import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {I18nextProvider} from 'react-i18next';
import i18next from 'i18next';
import common_en from "./translations/en/common.json";
import { initReactI18next } from 'react-i18next';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'; 
import { deepPurple, pink } from '@material-ui/core/colors';

const theme = createMuiTheme({
    palette: {
      primary: deepPurple,
      secondary: pink,
    },
});
i18next
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                common: common_en
            }
        },
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

ReactDOM.render(
    <I18nextProvider i18n={i18next}>
        <MuiThemeProvider theme={theme}>
            <App/>
        </MuiThemeProvider>
    </I18nextProvider>, 
    document.getElementById("root")
);

serviceWorker.unregister();
