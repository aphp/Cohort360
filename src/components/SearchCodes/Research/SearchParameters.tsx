import React, { useEffect, useState } from 'react'

import { Alert, Checkbox, FormControlLabel, Grid, Paper, Typography } from '@mui/material'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { Reference, References } from 'types/searchCodes'
import { Check, Warning } from '@mui/icons-material'
import { InputWrapper } from 'components/ui/Inputs'

type SearchParametersProps = {
  references: Reference[]
  onSelect: (search: string, values: Reference[]) => void
}

const SearchParameters = ({ references, onSelect }: SearchParametersProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [selectedReferences, setSelectedReferences] = useState(
    references.map((ref) => ({ ...ref, checked: ref.standard }))
  )
  const [error, setError] = useState(false)

  const handleSelectReference = (id: References) => {
    setSelectedReferences(
      selectedReferences.map((ref) => ({ ...ref, checked: id === ref.id ? !ref.checked : ref.checked }))
    )
  }

  useEffect(() => {
    setError(false)
    const selected = selectedReferences.filter((ref) => ref.checked)
    if (selected.length < 1) setError(true)
    onSelect(searchInput, selected)
  }, [selectedReferences, searchInput])

  return (
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item xs={12} marginBottom={2}>
        <Paper sx={{ padding: '20px' }}>
          <Grid item marginBottom={1}>
            <InputWrapper>
              <Typography variant="h3">Référentiels :</Typography>
            </InputWrapper>
          </Grid>
          <Grid item>
            {selectedReferences.map((ref) => (
              <>
                <FormControlLabel
                  key={ref.id}
                  control={<Checkbox checked={ref.checked} onChange={() => handleSelectReference(ref.id)} />}
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
            {error && (
              <Grid item marginTop={2}>
                <Alert severity="error" sx={{ fontSize: 12 }}>
                  Vous devez sélectionner au moins un référentiel pour effectuer une recherche.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ padding: '20px' }}>
          <Grid item marginBottom={1}>
            <InputWrapper>
              <Typography variant="h3">Recherche textuelle :</Typography>
            </InputWrapper>
          </Grid>
          <Grid item>
            <SearchInput
              value={searchInput}
              disabled={error}
              placeholder="Rechercher"
              onchange={(newValue) => setSearchInput(newValue)}
            />
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default SearchParameters
