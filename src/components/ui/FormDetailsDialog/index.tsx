import React from 'react'
import { Grid } from '@mui/material'

type FormDetailsDialogProps = {
  title: string
  content: any[]
  onClose: () => void
}

const FormDetailsDialog = ({ content }: FormDetailsDialogProps) => {
  return (
    // <Dialog open onClose={onClose}>
    //   <DialogTitle>{title}</DialogTitle>
    //   <DialogContent>
    <div>
      {content.map((row, index) => (
        <Grid container key={index}>
          <Grid container item xs={6}>
            {row.name}
          </Grid>
          <Grid container item xs={6}>
            {row.value}
          </Grid>
        </Grid>
      ))}
    </div>
    //   </DialogContent>
    //   <DialogActions>
    //     <Button onClick={onClose}>Fermer</Button>
    //   </DialogActions>
    // </Dialog>
  )
}

export default FormDetailsDialog