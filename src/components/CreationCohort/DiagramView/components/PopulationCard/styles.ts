import { makeStyles } from 'tss-react/mui'
import { Theme } from '@mui/material/styles'

const useStyles = makeStyles()((theme: Theme) => ({
  populationCard: {
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    padding: '8px 16px',
    border: '3px solid #D3DEE8',
    flex: 1,
    position: 'relative'
  },
  disabledPopulationCard: {
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    padding: '8px 16px',
    border: '3px solid #D3DEE8',
    flex: 1,
    position: 'relative'
  },
  typography: {
    padding: '0 1em',
    display: 'flex',
    alignItems: 'center'
  },
  centerContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leftDiv: {
    [theme.breakpoints.down('lg')]: {
      flexWrap: 'wrap'
    }
  },
  editButton: {
    color: 'currentcolor'
  },
  populationChip: {
    margin: 4,
    fontSize: 11,
    fontWeight: 'bold'
  }
}))

export default useStyles
