import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Checkbox, CircularProgress, Grid, LinearProgress, Pagination } from '@mui/material'
import { useDebounce } from 'utils/debounce'
import EnhancedTable from '../ScopeTreeTable'
import {
  getHeadCells,
  isSearchIndeterminate,
  isSearchSelected,
  onExpand,
  onSearchSelect,
  onSearchSelectAll,
  searchInPerimeters
} from '../utils/scopeTreeUtils'
import useStyles from '../utils/styles'
import { useAppSelector } from 'state'
import { ScopeState } from 'state/scope'
import { ScopeTreeRow } from 'types'
import { ScopeTreeSearchProps } from '../index'
import ScopeTreeHierarchy from '../ScopeTreeHierarchy/ScopeTreeHierarchy'

const Index: React.FC<ScopeTreeSearchProps> = (props) => {
  const {
    searchInput,
    selectedItems,
    setSelectedItems,
    searchRootRows,
    setSearchRootRows,
    executiveUnitType,
    isSelectionLoading,
    setIsSelectionLoading
  } = props

  const { classes } = useStyles()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))

  const { scopesList = [] } = scopeState
  const [openPopulation, setOpenPopulations] = useState<number[]>(scopeState.openPopulation)
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>([])
  const controllerRef = useRef<AbortController | null>(null)
  const [isEmpty, setIsEmpty] = useState<boolean>(true)
  const debouncedSearchTerm = useDebounce(700, searchInput)
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)

  const isHeadChecked: boolean = rootRows.length > 0 && rootRows.every((item) => isSearchSelected(item, selectedItems))
  const isHeadIndeterminate: boolean =
    !isHeadChecked && rootRows.length > 0 && !!rootRows.find((item) => isSearchIndeterminate(item, selectedItems))

  const headCheckbox: ReactElement = (
    <div style={{ padding: '0 0 0 4px' }}>
      <Checkbox
        color="secondary"
        checked={isHeadChecked}
        indeterminate={isHeadIndeterminate}
        onClick={() =>
          onSearchSelectAll(
            rootRows,
            selectedItems,
            setSelectedItems,
            isHeadChecked,
            searchRootRows,
            scopesList,
            isSelectionLoading,
            setIsSelectionLoading
          )
        }
      />
    </div>
  )
  const headCells = getHeadCells(headCheckbox, executiveUnitType)

  const search = async () =>
    await searchInPerimeters(
      debouncedSearchTerm,
      page,
      controllerRef,
      setIsSearchLoading,
      setIsEmpty,
      setCount,
      setRootRows,
      searchRootRows,
      setSearchRootRows,
      setOpenPopulations,
      executiveUnitType
    )

  useEffect(() => {
    if (debouncedSearchTerm) {
      search()
    }
    return () => {
      controllerRef.current?.abort()
    }
  }, [debouncedSearchTerm, page])

  return (
    <div className={classes.container}>
      {!isSearchLoading && <div className={classes.linearProgress}>{isSelectionLoading && <LinearProgress />}</div>}
      {isSearchLoading ? (
        <Grid container justifyContent="center">
          <CircularProgress size={50} />
        </Grid>
      ) : (
        <>
          {!debouncedSearchTerm || isEmpty ? (
            <EnhancedTable
              noCheckbox
              noPagination
              rows={rootRows}
              headCells={headCells}
              emptyRowsMessage={'Aucun résultat à afficher'}
            />
          ) : (
            <>
              <EnhancedTable noCheckbox noPagination rows={rootRows} headCells={headCells}>
                {(row: ScopeTreeRow, index: number) => {
                  if (!row) return <></>
                  const labelId = `enhanced-table-checkbox-${index}`

                  return (
                    <ScopeTreeHierarchy
                      row={row}
                      level={0}
                      parentAccess={row.access ?? '-'}
                      openPopulation={openPopulation}
                      labelId={labelId}
                      onExpand={(rowId: number) =>
                        onExpand(
                          rowId,
                          controllerRef,
                          openPopulation,
                          setOpenPopulations,
                          rootRows,
                          setRootRows,
                          selectedItems,
                          undefined,
                          executiveUnitType
                        )
                      }
                      onSelect={(row: ScopeTreeRow) =>
                        onSearchSelect(
                          row,
                          selectedItems,
                          searchRootRows,
                          scopesList,
                          isSelectionLoading,
                          setIsSelectionLoading,
                          setSelectedItems,
                          setSearchRootRows
                        )
                      }
                      isIndeterminate={(row: ScopeTreeRow) => isSearchIndeterminate(row, selectedItems)}
                      isSelected={(row: ScopeTreeRow) => isSearchSelected(row, selectedItems)}
                      isSearchMode={true}
                      executiveUnitType={executiveUnitType}
                    />
                  )
                }}
              </EnhancedTable>
              {
                <Pagination
                  className={classes.pagination}
                  count={Math.ceil((count ?? 0) / 100)}
                  shape="circular"
                  onChange={(event, page: number) => setPage && setPage(page)}
                  page={page}
                />
              }
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Index