import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'state'
import { Back_API_Response, LoadingStatus, ScopeElement, ScopeTreeRow, ScopeType } from 'types'
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
import ScopeTreeTest from './ScopeTreeTest'
import SelectedCodes from './SelectedCodes'
import { useSearchParameters } from 'hooks/useSearchParameters'
import { Hierarchy } from 'types/hierarchy'
import { mapHierarchyToMap } from 'utils/hierarchy'

type ScopeTreeProps = {
  selectedIds: string
  setSelectedItems: (selectedItems: ScopeTreeRow[]) => void
  isExecutiveUnit: boolean
  executiveUnitType?: ScopeType
}

const Index = ({ selectedIds, setSelectedItems, isExecutiveUnit, executiveUnitType }: ScopeTreeProps) => {
  const practitionerId = useAppSelector((state) => state.me)?.id || ''
  const { options, onChangeSearchInput, onChangePage, onChangeCount, onChangeSearchMode } = useSearchParameters()
  const [allHierarchy, setAllHierarchy] = useState<Map<string, Hierarchy<ScopeElement, string>>>(new Map())
  const [baseTree, setBaseTree] = useState<Back_API_Response<ScopeElement>>({ count: 0, results: [] as ScopeElement[] })
  const [initialLoading, setInitialLoading] = useState<LoadingStatus>(LoadingStatus.FETCHING)

  useEffect(() => {
    const fetch = async () => {
      const response = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters({ practitionerId, limit: -1 })
        : await servicesPerimeters.getRights({ practitionerId, limit: -1 })
      setAllHierarchy(mapHierarchyToMap(response.results))
    }
    fetch()
  }, [])

  useEffect(() => {
    const fetch = async () => {
      const response = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters({ practitionerId })
        : await servicesPerimeters.getRights({ practitionerId })
      setBaseTree(response)
      setInitialLoading(LoadingStatus.SUCCESS)
    }
    if (allHierarchy.size) fetch()
  }, [allHierarchy, practitionerId, isExecutiveUnit])

  const fetchChildren = useCallback(
    async (ids: string) => {
      const codes = ids.split(',')
      const results: Hierarchy<ScopeElement, string>[] = []
      codes.forEach((code) => {
        const toAdd = allHierarchy.get(code)
        if (toAdd) results.push(toAdd)
      })
      return results
    },
    [allHierarchy]
  )

  const fetchSearch = useCallback(
    async (search: string, page: number) => {
      const { results, count } = isExecutiveUnit
        ? await servicesPerimeters.getPerimeters({ practitionerId, search, page, limit: options.limit })
        : await servicesPerimeters.getRights({ practitionerId, search, page, limit: options.limit })
      onChangeCount(count)
      return results
    },
    [isExecutiveUnit, practitionerId]
  )

  const { hierarchy, selectedCodes, loadingStatus, selectAllStatus, search, expand, select, selectAll, deleteCode } =
    useHierarchy(baseTree.results, fetchChildren, selectedIds)

  const handleSearch = (searchValue: string, page: number) => {
    if (searchValue === '') onChangeCount(baseTree.count)
    onChangeSearchInput(searchValue)
    onChangePage(page)
    onChangeSearchMode(searchValue !== '')
    search(searchValue, page, fetchSearch)
  }

  return (
    <Grid container direction="column" wrap="nowrap" height="100%" overflow="hidden">
      <Grid style={{ width: '30%', margin: '8px 8px 8px 70%' }}>
        <SearchInput
          value={options.search}
          placeholder={'Rechercher'}
          onchange={(newValue) => handleSearch(newValue, 0)}
        />
      </Grid>

      <Grid container direction="column" wrap="wrap" height="100%" overflow="auto">
        {initialLoading === LoadingStatus.SUCCESS && loadingStatus === LoadingStatus.SUCCESS && baseTree.count && (
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
              <ScopeTreeTest
                selectAllStatus={selectAllStatus}
                executiveUnitType={executiveUnitType}
                searchMode={options.searchMode}
                hierarchy={hierarchy}
                onExpand={expand}
                onSelect={select}
                onSelectAll={selectAll}
              />

              <>
                {((initialLoading === LoadingStatus.SUCCESS && !baseTree.count) ||
                  (loadingStatus === LoadingStatus.SUCCESS && !hierarchy.length)) && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>Aucun résultat à afficher</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </>
            </TableContainer>

            <Grid item alignSelf="bottom">
              <Paper elevation={5}>
                <Grid item style={{ padding: '10px 40px', borderBottom: '2px solid #0063AF' }}>
                  <SelectedCodes values={selectedCodes} onDelete={deleteCode} />
                </Grid>

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
          </Grid>
        )}

        {(initialLoading === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.FETCHING) && (
          <Grid container justifyContent="center" alignContent="center" height={500}>
            <CircularProgress />
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}
export default Index
