import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { ScopeTreeRow } from 'types'
import {
  Checkbox,
  CircularProgress,
  Grid,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import EnhancedTable from '../ScopeTreeTable'
import useStyles from '../utils/styles'
import { AppDispatch, useAppDispatch, useAppSelector } from 'state'
import {
  getHeadCells,
  init,
  isSearchIndeterminate,
  isSearchSelected,
  onExpand,
  onExplorationSelectAll,
  onSearchSelect
} from '../utils/scopeTreeUtils'
import { ScopeState } from 'state/scope'
import { ScopeTreeExplorationProps } from '../index'
import ScopeTreeHierarchy from '../ScopeTreeHierarchy/ScopeTreeHierarchy'

const Index = (props: ScopeTreeExplorationProps) => {
  const {
    selectedItems,
    setSelectedItems,
    searchRootRows,
    executiveUnitType,
    isSelectionLoading,
    setIsSelectionLoading
  } = props

  const { classes } = useStyles()
  const dispatch: AppDispatch = useAppDispatch()

  const { scopeState } = useAppSelector<{
    scopeState: ScopeState
  }>((state) => ({
    scopeState: state.scope || {}
  }))
  const { scopesList = [] } = scopeState
  const [rootRows, setRootRows] = useState<ScopeTreeRow[]>(scopesList)
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false)
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [isEmpty, setIsEmpty] = useState<boolean>(!rootRows || rootRows.length === 0)
  const [openPopulation, setOpenPopulations] = useState<number[]>([])

  const isHeadChecked: boolean = rootRows.length > 0 && rootRows.every((item) => isSearchSelected(item, selectedItems))
  const isHeadIndeterminate: boolean =
    !isHeadChecked && rootRows.length > 0 && !!rootRows.find((item) => isSearchIndeterminate(item, selectedItems))

  const controllerRef: React.MutableRefObject<AbortController | null> = useRef<AbortController | null>(null)

  const headCheckbox: ReactElement = (
    <div style={{ padding: '0 0 0 4px' }}>
      <Checkbox
        color="secondary"
        checked={isHeadChecked}
        indeterminate={isHeadIndeterminate}
        onClick={() =>
          onExplorationSelectAll(rootRows, setSelectedItems, isHeadChecked, isSelectionLoading, setIsSelectionLoading)
        }
      />
    </div>
  )
  const headCells = getHeadCells(headCheckbox, executiveUnitType)

  useEffect(() => {
    init(
      setIsSearchLoading,
      controllerRef,
      rootRows,
      setRootRows,
      setOpenPopulations,
      setCount,
      setIsEmpty,
      dispatch,
      executiveUnitType
    )
  }, [])

  return (
    <div className={classes.container}>
      {isSearchLoading ? (
        <Grid container justifyContent="center">
          <CircularProgress size={50} />
        </Grid>
      ) : (
        <>
          {isEmpty ? (
            <TableContainer component={Paper}>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow className={classes.tableHead}>
                    <TableCell align="center" className={classes.tableHeadCell} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography className={classes.loadingSpinnerContainer}>Aucun résultat à afficher</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
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
                          dispatch,
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
                          setSelectedItems
                        )
                      }
                      isIndeterminate={(row: ScopeTreeRow) => isSearchIndeterminate(row, selectedItems)}
                      isSelected={(row: ScopeTreeRow) => isSearchSelected(row, selectedItems)}
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