import React from "react";
import {
  Box,
  TextField,
  IconButton,
  Icon,
  makeStyles,
  Button,
} from "@material-ui/core";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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
          props.onChange({
            choices: [...choices, { option: "", is_correct: false }],
          });
        }}
        style={{ borderStyle: "dashed", minHeight: 50 }}
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
            value={choices[i].option ? choices[i].option : ""}
            variant="filled"
            fullWidth
            onChange={(e) => props.onChoiceChange(i, e.target.value)}
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
              choices[i].is_correct = !choices[i].is_correct;
              let s = { choices: [...choices] };
              props.onChange(s);
            }}
          >
            <Icon color={choices[i].is_correct ? "primary" : "disabled"}>
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
  const choices = props.values;
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
            value={a.option}
            inputProps={{
              readOnly: true,
            }}
            variant="filled"
            fullWidth
            onChange={(e) => props.onChoiceChange(i, e.target.value)}
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
              choices.forEach((ii, index) => {
                choices[index].is_correct = false;
              });
              choices[i].is_correct = true;
              let s = { choices: [...choices] };
              props.onChange(s);
            }}
          >
            <Icon color={choices[i].is_correct ? "primary" : "disabled"}>
              check_circle
            </Icon>
          </IconButton>
        </Box>
      ))}
    </Box>
  ) : null;
}

export function ShortAnswer(props) {
  const answers = props.answers ? props.answers : [];
  const styles = useStyles();

  return (
    <Box className={styles.slideAnswer}>
      <Box
        className={styles.choice}
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <TextField
          type="text"
          label={"Short Answer"}
          multiline={true}
          rows={8}
          variant="filled"
          fullWidth
        />
      </Box>
    </Box>
  );
}

export function MatchingType(props) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div>Test</div>
    </DndProvider>
  );
}
