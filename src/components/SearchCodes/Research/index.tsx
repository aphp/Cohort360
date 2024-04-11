import React, { useMemo } from 'react'

import { Grid, Typography } from '@mui/material'
import List, { ListType } from 'components/ui/List'
import { Back_API_Response, HierarchyElementWithSystem } from 'types'
import ListItem from 'components/ui/List/ListItem'

type ResultsProps = {
  results: Back_API_Response<HierarchyElementWithSystem>
  selected: Map<string, true>
  onSelect: (ids: string[]) => void
  onSelectAll?: () => void
  onFetch: () => void
}

const Results = ({ results, selected, onSelect, onSelectAll, onFetch }: ResultsProps) => {
  const memoItems = useMemo(() => {
    return (results.results || []).map((result) => (
      <ListItem id={result.id} key={result.id}>
        <Typography fontWeight={700} color="#00000099">
          {result.label}
        </Typography>
      </ListItem>
    ))
  }, [results.results])

  return (
    <>
      <Grid container>
        {results.count! > 0 && (
          <Grid item xs={12} marginBottom={2}>
            <Typography fontWeight={800} color="secondary" fontSize={16}>
              {results.count} résultat(s)
            </Typography>
          </Grid>
        )}
        <Grid item xs={12}>
          <List
            type={ListType.MULTIPLE}
            allElements={memoItems}
            selectedIds={selected}
            count={results.count || 0}
            onSelect={(ids) => onSelect(ids as string[])}
            onSelectAll={onSelectAll}
            fetchPaginateData={onFetch}
          ></List>
        </Grid>
      </Grid>
    </>
  )
}

export default Results
