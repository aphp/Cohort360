import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/material/styles'
import BackgroundLogin from 'assets/images/background-login.png'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100vh'
  },
  rightPanel: {
    backgroundColor: '#FAFAFA'
  },
  logo: {
    marginBottom: theme.spacing(2)
  },
  bienvenue: {
    fontSize: '15px'
  },
  image: {
    backgroundImage: `url(${BackgroundLogin})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  submit: {
    margin: theme.spacing(2, 0, 5),
    backgroundColor: '#5BC5F2',
    color: 'white',
    height: '50px',
    width: '185px',
    borderRadius: '25px'
  },
  mention: {
    marginTop: '8px'
  }
}))

export default useStyles