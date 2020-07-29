import React, { useEffect, useCallback } from "react";
import Scrollbars from "react-custom-scrollbars";
import { connect } from "react-redux";
import { useTheme } from "@material-ui/core";

function Scrollbar(props) {
  const theme = useTheme().palette.type;
  const handleRenderThumbVertical = useCallback(
    ({ style, ...props }) => {
      return (
        <div
          {...props}
          style={{
            ...style,
          }}
          className={
            theme === "dark" ? "vertical-thumb dark" : "vertical-thumb"
          }
        />
      );
    },
    [theme]
  );
  const handleRenderThumbHorizontal = useCallback(
    ({ style, ...props }) => {
      return (
        <div
          {...props}
          style={{
            ...style,
          }}
          className={
            theme === "dark" ? "horizontal-thumb dark" : "horizontal-thumb"
          }
        />
      );
    },
    [theme]
  );
  return (
    <Scrollbars
      {...props}
      universal={true}
      renderThumbVertical={handleRenderThumbVertical}
      renderThumbHorizontal={handleRenderThumbHorizontal}
      renderTrackVertical={({ style, ...props }) => {
        return <div {...props} style={style} className="track-vertical" />;
      }}
      renderView={({ style, ...props }) => {
        return (
          <div
            {...props}
            style={{
              ...style,
              marginBottom: -15,
            }}
          />
        );
      }}
    >
      {props.children}
    </Scrollbars>
  );
}

export default Scrollbar;
