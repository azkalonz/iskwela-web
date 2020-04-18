import React, { Component } from "react";
import { useAuth0 } from "../react-auth0-spa.js";
import Loader from "../components/Loader";

function Login() {
  const { loading } = useAuth0();
  if (loading) {
    return <Loader />;
  }
  return <div>Login</div>;
}

export default Login;
