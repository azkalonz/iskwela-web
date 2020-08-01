import React from "react";
import { Button, CircularProgress } from "@material-ui/core";

function SavingButton(props) {
  return (
    <Button {...props} disabled={props.saving || false}>
      {props.saving === true && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={18} />
        </div>
      )}
      {props.children}
    </Button>
  );
}

export default SavingButton;
