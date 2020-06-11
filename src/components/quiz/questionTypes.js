import React from "react";
import {
  Box,
  TextField,
  IconButton,
  Icon,
  makeStyles,
  Button,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  slideAnswer: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "space-between",
    "&>div": {
      marginBottom: theme.spacing(2),
    },
  },
  choice: {
    "&>.remove-answer": {
      display: "none",
    },
    "&:hover>.remove-answer": {
      display: "block",
    },
    "& input": {
      paddingRight: 90,
    },
  },
}));
export function MultipleChoice(props) {
  const choices = props.choices;
  const answers = props.answers ? props.answers : [];
  const styles = useStyles();

  const add_choice = (
    <Box
      width={props.fullWidth ? "100%" : "49%"}
      style={{ cursor: "pointer" }}
      position="relative"
      display="flex"
      justifyContent="center"
    >
      <Button
        fullWidth
        variant="outlined"
        onClick={() => {
          props.onChange({ choices: [...choices, ""] });
        }}
        style={{ borderStyle: "dashed" }}
      >
        <Icon>add</Icon>
      </Button>
    </Box>
  );
  return choices ? (
    <Box className={styles.slideAnswer}>
      {choices.map((a, i) => (
        <Box
          className={styles.choice}
          key={i}
          style={{
            position: "relative",
            width: props.fullWidth ? "100%" : "49%",
          }}
        >
          <TextField
            type="text"
            label={"Choice " + String.fromCharCode(65 + i)}
            value={choices[i] ? choices[i] : ""}
            variant="filled"
            fullWidth
            onChange={(e) => props.onChoiceChange(i, e.target.value)}
            error={
              props.errors && props.errors[i] && choices[i] !== ""
                ? true
                : false
            }
            helperText={props.errors && props.errors[i] ? props.errors[i] : ""}
          />
          {i > 1 && (
            <div
              style={{
                position: "absolute",
                right: 45,
                top: 5,
              }}
              className="remove-answer"
            >
              <IconButton
                onClick={() => {
                  choices.splice(i, 1);
                  props.onChange({ choices: [...choices] });
                }}
              >
                <Icon
                  style={{
                    color: "#fff",
                    background: "red",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
                  close
                </Icon>
              </IconButton>
            </div>
          )}
          <IconButton
            style={{
              position: "absolute",
              right: 0,
              top: 5,
            }}
            onClick={() => {
              if (choices[i]) {
                if (answers.indexOf(choices[i]) >= 0)
                  answers.splice(answers.indexOf(choices[i]), 1);
                else answers.push(choices[i]);
              }
              let s = { choices: [...choices], answers };
              props.onChange(s);
            }}
          >
            <Icon
              color={
                answers && choices[i] && answers.indexOf(choices[i]) >= 0
                  ? "primary"
                  : "disabled"
              }
            >
              {props.icon ? props.icon : "check_circle"}
            </Icon>
          </IconButton>
        </Box>
      ))}
      {add_choice}
    </Box>
  ) : (
    add_choice
  );
}

export function TrueOrFalse(props) {
  const choices = props.values ? props.values : ["True", "False"];
  const answers = props.answers ? props.answers : [];
  const styles = useStyles();

  return choices ? (
    <Box className={styles.slideAnswer}>
      {choices.map((a, i) => (
        <Box
          className={styles.choice}
          key={i}
          style={{
            position: "relative",
            width: props.fullWidth ? "100%" : "49%",
          }}
        >
          <TextField
            type="text"
            label={"Choice " + String.fromCharCode(65 + i)}
            value={a}
            inputProps={{
              readOnly: true,
            }}
            variant="filled"
            fullWidth
            onChange={(e) => props.onChoiceChange(i, e.target.value)}
            error={
              props.errors && props.errors[i] && choices[i] !== ""
                ? true
                : false
            }
            helperText={props.errors && props.errors[i] ? props.errors[i] : ""}
          />
          {i > 1 && (
            <div
              style={{
                position: "absolute",
                right: 45,
                top: 5,
              }}
              className="remove-answer"
            >
              <IconButton
                onClick={() => {
                  choices.splice(i, 1);
                  props.onChange({ choices: [...choices] });
                }}
              >
                <Icon
                  style={{
                    color: "#fff",
                    background: "red",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
                  close
                </Icon>
              </IconButton>
            </div>
          )}
          <IconButton
            style={{
              position: "absolute",
              right: 0,
              top: 5,
            }}
            onClick={() => {
              let s = { choices: [...choices], answers: a };
              props.onChange(s);
            }}
          >
            <Icon color={answers.indexOf(a) >= 0 ? "primary" : "disabled"}>
              check_circle
            </Icon>
          </IconButton>
        </Box>
      ))}
    </Box>
  ) : null;
}
