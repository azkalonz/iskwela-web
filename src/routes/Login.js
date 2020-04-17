import React, { Component } from "react";
import { useAuth0 } from "../react-auth0-spa";

function Login() {
  const { loading } = useAuth0();
  if (loading) {
    return <div>Loading...</div>;
  }
  return <div>Login</div>;
}

export default Login;
