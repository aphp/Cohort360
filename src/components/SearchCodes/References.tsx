import React, { useEffect, useState } from 'react'

import { Checkbox, FormControlLabel, Grid, Paper, Radio, Typography } from '@mui/material'
import { Reference, References } from 'types/searchCodes'
import { Check, Warning } from '@mui/icons-material'
import { InputWrapper } from 'components/ui/Inputs'

export enum Type {
  SINGLE,
  MULTIPLE
}

type ReferencesProps = {
  type: Type
  values: Reference[]
  onSelect: (values: Reference[]) => void
}

const ReferencesParameters = ({ values, onSelect, type }: ReferencesProps) => {
  const handleSelectReference = (id: References) => {
    const newReferences = values.map((ref) => ({
      ...ref,
      checked: type === Type.SINGLE ? id === ref.id : id === ref.id ? !ref.checked : ref.checked
    }))
    onSelect(newReferences)
  }

  return (
    <Paper sx={{ padding: '20px' }}>
      <Grid item marginBottom={1}>
        <InputWrapper>
          <Typography variant="h3">Référentiels :</Typography>
        </InputWrapper>
      </Grid>
      <Grid item>
        {values.map((ref) => (
          <>
            <FormControlLabel
              key={ref.id}
              control={
                type === Type.MULTIPLE ? (
                  <Checkbox checked={ref.checked} onChange={() => handleSelectReference(ref.id)} />
                ) : (
                  <Radio checked={ref.checked} onChange={() => handleSelectReference(ref.id)} />
                )
              }
              label={
                <Grid container alignItems="center">
                  {ref.label}
                  {ref.standard ? (
                    <Check fontSize="small" style={{ color: 'green', fontSize: 13, marginLeft: 2 }} />
                  ) : (
                    <Warning style={{ color: 'orange', fontSize: 14, marginLeft: 2 }} />
                  )}
                </Grid>
              }
            />
          </>
        ))}
      </Grid>
    </Paper>
  )
}

export default ReferencesParameters
