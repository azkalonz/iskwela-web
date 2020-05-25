import React from "react";
import { Route, Redirect } from "react-router-dom";

const dummyusers = require("../screens/dummyusers.json");

function fakeAuth(cred) {
  localStorage.removeItem("user");
  if (!cred) return false;
  if (!JSON.parse(cred)) return false;
  let user = dummyusers.find((u) => u.user_id === JSON.parse(cred).user_id);
  if (!user) return false;
  localStorage["user"] = cred;
  return true;
}

export default function PrivateRoute({
  component: Component,
  authed,
  ...rest
}) {
  authed = fakeAuth(authed);
  return (
    <Route
      {...rest}
      render={(props) =>
        authed ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login" }} />
        )
      }
    />
  );
}
