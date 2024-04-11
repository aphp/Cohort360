import React, { useState } from 'react'

import { Grid, IconButton, Typography } from '@mui/material'
import Chip from 'components/ui/Chip'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { HierarchyElementWithSystem } from 'types'

type SelectedCodesProps = {
  values: HierarchyElementWithSystem[]
  onDelete: (id: string) => void
}

const SelectedCodes = ({ values, onDelete }: SelectedCodesProps) => {
  const [openSelectedCodesDrawer, setOpenSelectedCodesDrawer] = useState(false)

  return (
    <>
      {openSelectedCodesDrawer && (
        <Grid
          item
          container
          xs={12}
          justifyContent="space-between"
          marginBottom={2}
          style={{ maxHeight: 200, overflowX: 'hidden', overflowY: 'auto' }}
        >
          {values?.length > 0 && (
            <Grid item xs={12} container marginBottom={3} spacing={1}>
              {values
                .filter((code) => code.label)
                .map((code) => (
                  <Grid item xs={4} container key={code.id}>
                    <Chip label={code.label} onDelete={() => onDelete(code.id)} />
                  </Grid>
                ))}
            </Grid>
          )}
        </Grid>
      )}
      <Grid item container xs={12} justifyContent="space-between" marginBottom={2}>
        <Grid item xs={4} container>
          <Typography textAlign="center" fontWeight={900}>
            {values?.length} sélectionné(s)
          </Typography>
        </Grid>
        <Grid item xs={1} container justifyContent="flex-end">
          {values.length > 0 && (
            <IconButton onClick={() => setOpenSelectedCodesDrawer(!openSelectedCodesDrawer)}>
              {openSelectedCodesDrawer ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
            </IconButton>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default SelectedCodes
