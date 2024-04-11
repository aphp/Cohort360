import React, { useState } from 'react'

import { Alert, Grid, Paper, Typography } from '@mui/material'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Reference } from 'types/searchCodes'
import { InputWrapper } from 'components/ui/Inputs'
import ReferencesParameters, { Type } from './References'

type SearchParametersProps = {
  references: Reference[]
  onSelectSearch: (search: string) => void
  onSelectReferences: (values: Reference[]) => void
}

const SearchParameters = ({ references, onSelectSearch, onSelectReferences }: SearchParametersProps) => {
  const [error, setError] = useState(false)

  const handleReferenceChange = (references: Reference[]) => {
    setError(true)
    if (references.filter((ref) => ref.checked).length) {
      setError(false)
    }
    onSelectReferences(references)
  }

  return (
    <>
      <Grid item xs={12}>
        <ReferencesParameters values={references} onSelect={handleReferenceChange} type={Type.MULTIPLE} />
        {error && (
          <Grid item marginTop={2}>
            <Alert severity="error" sx={{ fontSize: 12 }}>
              Vous devez sélectionner au moins un référentiel pour effectuer une recherche.
            </Alert>
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ padding: '20px' }}>
          <Grid item>
            <InputWrapper>
              <Typography variant="h3">Recherche textuelle :</Typography>
            </InputWrapper>
          </Grid>
          <Grid item>
            <SearchInput value="" disabled={error} placeholder="Rechercher" onchange={onSelectSearch} />
          </Grid>
        </Paper>
      </Grid>
    </>
  )
}

export default SearchParameters
