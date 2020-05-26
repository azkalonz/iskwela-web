import React, { useState, useEffect } from "react";
import { useAuth0 } from "../react-auth0-spa.js";
import { makeStyles } from "@material-ui/core/styles";
import Loader from "../components/Loader";
import { apiAuth, apiFetch } from "../components/Connection";
import $ from "jquery";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Box from "@material-ui/core/Box";
import JoinClassDialog from "../components/JoinClass";

const useStyles = makeStyles({
  root: {
    width: 240,
    marginRight: 12,
  },
  media: {
    height: 120,
  },
});

const ClassItem = ({ details }) => {
  const classes = useStyles();
  details = details[0];
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image={details.img}
          title="Contemplative Reptile"
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="h5" size="small">
            {details.title}
          </Typography>
          {/* <Typography variant="body2" color="textSecondary" component="p">
            {details.summary}
          </Typography> */}
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          Progress
        </Button>
        <Button size="small" color="primary">
          View Tasks
        </Button>
      </CardActions>
    </Card>
  );
};
const Profile = () => {
  const { user, loading } = useAuth0();
  const [userInfo, setUserInfo] = useState();
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (user) {
      apiAuth(user).then(({ data }) => {
        if (!data.auth) return;
        apiFetch({
          url: "/api?operation=getUserInfo&param=" + user.email,
          method: "get",
          after: (e) => {
            setUserInfo(() => {
              let mergeAuth0 = {
                ...user,
                ...e.data,
              };
              return mergeAuth0;
            });
            $("#profile").fadeIn();
          },
        });
      });
    }
  }, [user]);
  return (
    <div>
      <Loader display={loading ? "flex" : "none"} />
      <Container maxWidth="xl">
        <JoinClassDialog
          open={openDialog}
          handleClose={() => {
            setOpenDialog(false);
          }}
        />
        <div id="profile" style={{ display: "none" }}>
          <Box m="2em" />
          {userInfo ? <img src={userInfo.picture} /> : null}
          {/* {userInfo
            ? Object.keys(userInfo).map((key, index) => (
                <div key={index}>
                  <b>{key} : </b>
                  {typeof userInfo[key] == "object"
                    ? JSON.stringify(userInfo[key])
                    : userInfo[key]}
                </div>
              ))
            : null} */}
          <div>
            <Typography gutterBottom variant="h5" component="h1">
              Class
            </Typography>
            <div style={{ display: "flex" }}>
              {userInfo ? (
                userInfo.classes.length ? (
                  userInfo.classes.map((c, i) => {
                    return <ClassItem key={i} details={c} />;
                  })
                ) : (
                  <Button
                    variant="contained"
                    color="default"
                    onClick={() => {
                      setOpenDialog(true);
                    }}
                  >
                    Join a Class
                  </Button>
                )
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Profile;
