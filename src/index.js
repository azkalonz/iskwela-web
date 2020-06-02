import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import common_en from "./translations/en/common.json";
import { initReactI18next } from "react-i18next";
import { Provider } from "react-redux";
import store from "./components/redux/store";

const _DEV = true;

i18next.use(initReactI18next).init({
  resources: {
    en: {
      common: common_en,
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

if (!_DEV) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.clear();
}

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18next}>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </I18nextProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
