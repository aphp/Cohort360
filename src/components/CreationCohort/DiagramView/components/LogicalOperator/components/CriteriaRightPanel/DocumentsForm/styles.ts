import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
  inputItem: {
    margin: '1em 1em 0',
    width: 'calc(100% - 2em)'
  },
  searchInput: {
    margin: '0px !important',
    '& > div': {
      borderRadius: 5,
      height: 50,
      padding: '10px 0px'
    }
  }
}))

export default useStyles
