import React from 'react';
import { 
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  FormControlLabel,
  Grid,
  TextField,
  Typography
} from '@material-ui/core';
import { LockOutlined } from '@material-ui/icons';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        SchoolHub
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    padding: theme.spacing(2),
    color: "white",
  },
  title: {
    marginTop: theme.spacing(2),
  },
}));


export default function Login() {
  const history = useHistory();
  const { t } = useTranslation();
  const classes = useStyles();

  const handleClick = () => {
    history.push('/teacher/dashboard');
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5" className={classes.title}>
        { t('common:login.title') }
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="id_number"
            label={ t('common:login.idNumber') }
            name="id_number"
            autoComplete="id_number"
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label={ t('common:login.password') }
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Grid 
            container
            direction="row"
            justify="space-evenly"
            alignItems="center">
            <Grid item xs>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label={ t('common:login.rememberMe') }
              />
            </Grid>
            <Grid 
              item 
              justify="flex-end">
              <Link href="#" variant="body2">
              { t('common:login.forgotPassword') }
              </Link>
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={classes.submit}
            color="primary"
            onClick={handleClick}
          >
            { t('common:login.signIn') }
          </Button>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
}
