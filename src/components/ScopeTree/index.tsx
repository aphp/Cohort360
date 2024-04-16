import React, { useCallback, useEffect } from 'react'
import { useAppSelector } from 'state'
import { LoadingStatus, ScopeElement } from 'types'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import {
  CircularProgress,
  Grid,
  Pagination,
  Paper,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@mui/material'
import { useHierarchy } from '../../hooks/hierarchy/useHierarchy'
import servicesPerimeters from '../../services/aphp/servicePerimeters'
import SelectedCodes from './SelectedCodes'
import { useSearchParameters } from 'hooks/useSearchParameters'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'
import ScopeTree from './ScopeTree'

type ScopeTreeProps = {
  baseTree: Hierarchy<ScopeElement, string>[]
  selectedNodes: Hierarchy<ScopeElement, string>[]
  sourceType: SourceType
  onSelect: (selectedItems: Hierarchy<ScopeElement, string>[]) => void
}

const Index = ({ baseTree, selectedNodes, sourceType, onSelect }: ScopeTreeProps) => {
  const practitionerId = useAppSelector((state) => state.me)?.id || ''
  const { options, onChangeSearchInput, onChangePage, onChangeCount, onChangeSearchMode } = useSearchParameters()

  const fetchChildren = useCallback(
    async (ids: string) => {
      const { results } =
        sourceType === SourceType.ALL
          ? await servicesPerimeters.getRights({ practitionerId, ids, limit: -1, sourceType })
          : await servicesPerimeters.getPerimeters({ practitionerId, ids, limit: -1, sourceType })
      return results
    },
    [practitionerId, sourceType]
  )

  const fetchSearch = useCallback(
    async (search: string, page: number) => {
      const { results, count } =
        sourceType === SourceType.ALL
          ? await servicesPerimeters.getRights({ practitionerId, search, page, limit: options.limit, sourceType })
          : await servicesPerimeters.getPerimeters({ practitionerId, search, page, limit: options.limit, sourceType })
      onChangeCount(count)
      return results
    },
    [practitionerId, sourceType]
  )

  const { hierarchy, selectedCodes, loadingStatus, selectAllStatus, search, expand, select, selectAll, deleteCode } =
    useHierarchy(baseTree, selectedNodes, fetchChildren)

  const handleSearch = (searchValue: string, page: number) => {
    if (searchValue === '') onChangeCount(baseTree.length)
    onChangeSearchInput(searchValue)
    onChangePage(page)
    onChangeSearchMode(searchValue !== '')
    search(searchValue, page, fetchSearch)
  }

  useEffect(() => {
    onSelect(selectedCodes.map((item) => ({ ...item, subItems: [] })))
  }, [selectedCodes])

  return (
    <Grid container direction="column" wrap="nowrap" height="100%" overflow="hidden">
      <Grid container padding={'20px'}>
        <Grid container sx={{ marginBottom: '15px' }}>
          <SearchInput
            value={options.search}
            placeholder={'Rechercher'}
            onchange={(newValue) => handleSearch(newValue, 0)}
          />
        </Grid>
        <Grid container>
          <SelectedCodes values={selectedCodes} onDelete={deleteCode} />
        </Grid>
      </Grid>

      <Grid container direction="column" wrap="wrap" height="100%" overflow="auto">
        {loadingStatus === LoadingStatus.SUCCESS && baseTree.length && (
          <Grid
            item
            container
            direction="column"
            justifyContent="space-between"
            wrap="nowrap"
            height="100%"
            style={{ overflowX: 'auto' }}
          >
            <TableContainer component={Paper} style={{ overflowX: 'hidden' }}>
              <ScopeTree
                selectAllStatus={selectAllStatus}
                sourceType={SourceType.ALL}
                searchMode={options.searchMode}
                hierarchy={hierarchy}
                onExpand={expand}
                onSelect={select}
                onSelectAll={selectAll}
              />

              <>
                {loadingStatus === LoadingStatus.SUCCESS && !hierarchy.length && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>Aucun résultat à afficher</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </>
            </TableContainer>
            {options.totalPages > 1 && (
              <Grid item alignSelf="bottom">
                <Paper elevation={5}>
                  <Grid item container justifyContent="center" style={{ padding: '10px 40px' }}>
                    <Pagination
                      count={options.totalPages || 1}
                      color="primary"
                      onChange={(event, page: number) => handleSearch(options.search, page - 1)}
                      page={options.page + 1}
                    />
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {loadingStatus === LoadingStatus.FETCHING && (
          <Grid container justifyContent="center" alignContent="center" height={500}>
            <CircularProgress />
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default Index
