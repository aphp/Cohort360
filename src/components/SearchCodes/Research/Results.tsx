import React from 'react'

import { CircularProgress, Grid, Typography } from '@mui/material'
import List from 'components/ui/List'
import { Back_API_Response, HierarchyElementWithSystem } from 'types'
import ListItem from 'components/ui/List/ListItem'

type ResultsProps = {
  results: Back_API_Response<HierarchyElementWithSystem>
  loading: boolean
  onFetch: () => void
}

const Results = ({ results, loading, onFetch }: ResultsProps) => {
  return (
    <Grid container justifyContent="center" alignItems="center">
      {loading && <CircularProgress />}
      {!loading && (
        <List
          itemsToRender={(results.results || []).map((result) => (
            <ListItem id={result.id}>
              <Typography>{result.label}</Typography>
            </ListItem>
          ))}
          count={results.count || 0}
          onSelect={() => {}}
          fetchPaginateData={onFetch}
        ></List>
      )}
    </Grid>
  )
}

export default Results
