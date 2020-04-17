import React, { Component } from "react";
import { useAuth0 } from "../react-auth0-spa.js";

function Profile() {
  const { loading } = useAuth0();
  if (loading) {
    return <div>Loading...</div>;
  }
  return <div>Profile</div>;
}

export default Profile;
