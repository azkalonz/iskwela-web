import React, { useEffect } from "react";
import { useAuth0 } from "../react-auth0-spa.js";
import Loader from "../components/Loader";
import Alert from "@material-ui/lab/Alert";
import { apiAuth } from "../components/Connection";
function Home() {
  const { loading, user } = useAuth0();
  useEffect(() => {
    if (!loading) {
    }
    if (user) {
      apiAuth(user);
    } else {
      localStorage.removeItem("token");
    }
  }, [user, loading]);

  return (
    <div>
      <Loader display={loading ? "flex" : "none"} />
      {!user && <Alert severity="warning">Please login to continue</Alert>}
      {user && <h1>Welcome {user.nickname}!</h1>}
    </div>
  );
}

export default Home;
