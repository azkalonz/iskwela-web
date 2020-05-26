import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles((theme) => ({
  loaderContainer: {
    minWidth: "100%",
    minHeight: "80vh",
    justifyContent: "center",
    alignItems: "center",
  },
}));

export default function Loader(props) {
  const classes = useStyles();
  return (
    <div className={classes.loaderContainer} style={{ display: props.display }}>
      <CircularProgress />
    </div>
  );
}
