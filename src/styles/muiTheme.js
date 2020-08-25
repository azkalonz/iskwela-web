import store from "../components/redux/store";
import { createMuiTheme } from "@material-ui/core";

const primaryColor = "#7539ff";
const secondaryColor = "#FFD026";
const defaultTheme = createMuiTheme();

export default function getTheme() {
  const theme = store.getState().theme;
  return createMuiTheme({
    typography: {
      fontFamily: "'Work Sans', sans-serif",
    },
    overrides: {
      MuiCssBaseline: {
        "@global": {
          body: {
            ...(theme === "dark" ? { backgroundColor: "#000" } : {}),
          },
          "*": {
            ...(theme === "dark"
              ? {
                  borderColor: "rgba(255,255,255,0.16)!important",
                }
              : {}),
          },
          ".MuiPagination-ul": {
            justifyContent: "flex-end",
          },
          "::selection": {
            backgroundColor: primaryColor,
            color: "#fff",
          },
          ".react-loading-skeleton": {
            backgroundImage:
              "linear-gradient( 90deg,rgba(255, 255, 255, 0),rgba(255,255,255,0.14),rgba(65, 65, 65, 0) )!important",
          },
          ":focus": {
            outline: 0,
          },
          "#selected-option": {
            position: "relative",
            "&:before": {
              content: "''",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: primaryColor,
              opacity: 0.2,
              zIndex: -1,
            },
          },
        },
      },
      MuiCard: {
        root: {
          "&.class-card-tag": {
            width: "100%",
            position: "relative",
            "& .media": {
              height: 215,
            },
            "& .title-container": {
              position: "absolute",
              top: 10,
              left: 10,
            },
          },
        },
      },
      MuiTab: {
        root: {
          maxWidth: "100%",
        },
      },
      MuiTooltip: {
        tooltip: {
          fontSize: "1em",
          backgroundColor: "rgba(107, 43, 255, 0.72)",
          position: "relative",
        },
        tooltipPlacementRight: {
          "&::before": {
            content: "''",
            position: "absolute;",
            top: 7,
            left: -22,
            transform: "scaleX(1.3) scaleY(0.5) skewY(-40deg)",
            border: "10px solid transparent",
            borderRightColor: "rgba(107, 43, 255, 0.72)",
          },
        },
      },
      MuiAppBar: {
        root: {
          background: theme === "dark" ? "#1d1d1d!important" : "#fff!important",
          border: theme === "dark" ? "none" : "1px solid rgb(233, 228, 239)",
          borderRadius: 0,
          "& > div": {
            border: "none",
          },
          "&.shadowed": {
            boxShadow: "0 2px 6px 0 " + (theme === "dark" ? "#222" : "#F1E6FF"),
          },
        },
      },
      MuiTouchRipple: {
        child: {
          backgroundColor: primaryColor,
        },
      },
      MuiExpansionPanel: {
        root: {
          "&::before": {
            display: "none",
          },
        },
      },
      MuiDrawer: {
        paperAnchorDockedLeft: {
          borderRight: "none",
          boxShadow: "4px 0 3px rgba(143, 45, 253,0.1)!important",
        },
      },
      MuiOutlinedInput: {
        root: {
          // paddingLeft: 10,
          border: "1px solid ",
          borderColor:
            theme === "dark"
              ? "rgba(255,255,255,0.22)"
              : "rgba(116,0,255,0.20)",
          backgroundColor:
            theme === "dark" ? "#1d1d1d!important" : "#EEE6FF!important",
          borderRadius: 6,
          "&.Mui-focused": {
            borderColor: "#7400FF",
          },
          "&:hover": {
            backgroundColor:
              theme === "dark" ? "#1d1d1d!important" : "#EEE6FF!important",
          },
          "&:focus": {
            backgroundColor:
              theme === "dark" ? "#1d1d1d!important" : "#EEE6FF!important",
          },
        },
      },
      MuiDivider: {
        root: {
          marginTop: 1,
        },
      },
      MuiDialogContent: {
        root: {
          "& p": {
            fontWeight: 400,
            fontSize: 14,
          },
        },
      },
      MuiDialog: {
        paper: {
          minWidth: 500,
          [defaultTheme.breakpoints.down("sm")]: {
            minWidth: "auto",
          },
        },
      },
      MuiAvatar: {
        img: {
          width: "100%",
          height: "auto",
        },
        root: {
          fontSize: "1em",
          zIndex: "10!important",
          background: "#fff",
        },
      },
      MuiPaper: {
        root: {
          ...(theme === "dark" ? { backgroundColor: "#111" } : {}),
          "&.shadowed": {
            boxShadow: "0 2px 6px 0 " + (theme === "dark" ? "#222" : "#F1E6FF"),
            "&,& .card-media": {
              transition: "all 0.7s cubic-bezier(0.05, 0.94, 0.55, 1.01)",
            },
            "&.card": {
              "& button.MuiButtonBase-root.MuiCardActionArea-root:hover": {
                backgroundColor: "rgba(0,0,0,0)!important",
              },
              "& .MuiCardActionArea-focusHighlight, & .MuiTouchRipple-root": {
                borderRadius: 20,
              },
            },
            "&.card:hover": {
              transform: "translateY(-3px)",
              boxShadow:
                "0 10px 10px 0 " + (theme === "dark" ? "#222" : "#EFE6FB"),
              "& .card-media": {
                backgroundSize: "110%!important",
              },
            },
          },
          "&:not(.MuiCard-root):not(.MuiAppBar-root):not(.MuiDialog-paper):not(.MuiAlert-root):not(.box-container)": {
            ...(theme === "dark"
              ? { backgroundColor: "#111" }
              : {
                  boxShadow: "0 2px 6px 0 #F1E6FF!important",
                  border: "1px solid rgb(233, 228, 239)",
                }),
            borderRadius: 4,
          },
        },
      },
      MuiToolbar: {
        regular: {
          minHeight: "51px!important",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
        },
      },
      MuiListItem: {
        root: {
          "&:hover": {
            cursor: "pointer!important",
            ...(theme === "dark"
              ? { backgroundColor: "#111" }
              : { backgroundColor: "#fff" }),
          },
        },
      },
      MuiSelect: {
        root: {
          padding: 10,
        },
      },
      MuiButton: {
        contained: {
          boxShadow: "0 1px 10px 0 rgba(83, 28, 209, 0.34)",
        },
        root: {
          [defaultTheme.breakpoints.down("sm")]: {
            width: "100%",
            marginTop: 5,
            marginBottom: 5,
            whiteSpace: "nowrap",
          },
        },
      },
      MuiButtonBase: {
        root: {
          "&.MuiPaginationItem-root": {
            color: primaryColor,
            fontWeight: 500,
          },
        },
      },
      MuiInputLabel: {
        animated: {
          transition:
            "color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 100ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
        },
        outlined: {
          "&.MuiInputLabel-shrink": {
            transform: "translate(0px, -20px) scale(0.9)",
            fontWeight: "bold",
            color: defaultTheme.palette.grey[800],
          },
        },
        root: {
          color: "#424242",
        },
      },
      MuiFormControl: {
        root: {
          "& fieldset": {
            display: "none",
          },
          "&.themed-input.select > div": {
            paddingTop: "9px!important",
            padding: 9,
          },
        },
      },
      MuiTextField: {
        root: {
          "&.themed-input": {
            borderRadius: 4,
            "& .MuiInputLabel-shrink": {
              transform: "translate(0px, -20px) scale(0.9)",
              fontWeight: "bold",
              color: defaultTheme.palette.grey[800],
            },
            "&:not(.no-margin)": {
              marginTop: defaultTheme.spacing(4),
            },
            "& fieldset": {
              display: "none",
            },
            "&.light .MuiInputLabel-shrink": {
              color: "#fff",
            },
            "&.small > div": {
              height: 46,
            },
            "&.date": {
              margin: 0,
              "& > div": {
                margin: 0,
                padding: 8,
                height: 56,
                backgroundColor:
                  theme === "dark" ? "#1d1d1d!important" : "#EEE6FF!important",
                "&::before,&::after": {
                  display: "none",
                },
              },
            },
          },
        },
      },
      MuiTypography: {
        root: {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      },
    },
    palette: {
      type: theme,
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: secondaryColor,
      },
      grey:
        theme === "dark"
          ? {
              100: "#171717",
              200: "#191919",
              300: "#1e1e1e",
            }
          : {},
    },
  });
}
