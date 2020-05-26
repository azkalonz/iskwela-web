import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import Zoom from "@material-ui/core/Zoom";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import LinearProgress from "@material-ui/core/LinearProgress";
import Chip from "@material-ui/core/Chip";
import { apiAuth, apiFetch } from "./Connection";
import { useAuth0 } from "../react-auth0-spa.js";

export default function JoinClassDialog(props) {
  const [classNum, setClassNum] = useState("");
  const [join, setJoin] = useState(false);
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (join) {
      if (user && isAuthenticated) {
        apiAuth(user).then(({ data }) => {
          if (!data.auth) return;
          apiFetch({
            url:
              "/api?operation=joinClass&param=" + user.email + "~" + classNum,
            method: "get",
            after: (e) => {
              props.handleClose();
              setJoin(false);
              window.location = window.location.pathname;
            },
          });
        });
      }
    }
  }, [join, isAuthenticated, props, classNum, user]);
  const joinClass = () => {
    setJoin(true);
  };
  const insertToInput = (e) => {
    setClassNum(e);
  };
  const handleChange = (e) => {
    setClassNum(e.target.value);
  };
  return (
    <div>
      <Dialog
        TransitionComponent={Zoom}
        open={props.open}
        onClose={join ? null : props.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <LinearProgress
          color="secondary"
          style={{ display: join ? "block" : "none" }}
        />
        <DialogTitle id="form-dialog-title">Join Class</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Chip
              label="XhYia"
              disabled={join ? true : false}
              component="a"
              onClick={() => {
                insertToInput("XhYia");
              }}
              clickable
            />
            <Chip
              disabled={join ? true : false}
              label="AhS87x"
              component="a"
              onClick={() => {
                insertToInput("AhS87x");
              }}
              clickable
            />
          </DialogContentText>
          <TextField
            disabled={join ? true : false}
            autoFocus
            margin="dense"
            id="name"
            label="Class Code"
            type="text"
            value={classNum}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={props.handleClose}
            disabled={join ? true : false}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={joinClass}
            disabled={join ? true : false}
          >
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
