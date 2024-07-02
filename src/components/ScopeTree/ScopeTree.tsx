import React, { Fragment, useEffect, useState } from 'react'

import {
  Breadcrumbs,
  Checkbox,
  CircularProgress,
  Grid,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { LoadingStatus, ScopeElement, SelectedStatus } from 'types'
import { Hierarchy, NodeValidity } from 'types/hierarchy'
import { IndeterminateCheckBoxOutlined, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import displayDigit from 'utils/displayDigit'
import useStyles from './styles'
import { SourceType } from 'types/scope'
import { sort } from 'utils/arrays'

type HierarchyItemProps = {
  item: Hierarchy<ScopeElement, string>
  path: string[]
  searchMode: boolean
  loading: { search: LoadingStatus; expand: LoadingStatus }
  onSelect: (node: Hierarchy<ScopeElement, string>, toAdd: boolean) => void
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
}

const ScopeTreeItem = ({ item, path, searchMode, loading, onSelect, onExpand }: HierarchyItemProps) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false)
  const { id, name, subItems, status, source_value, cohort_size, full_path } = item
  const canExpand =
    !subItems || (subItems.length > -1 && !subItems.every((subItem) => subItem.validity === NodeValidity.NOT_VALID))

  const handleOpen = () => {
    setOpen(true)
    setInternalLoading(true)
    onExpand(item)
  }

  useEffect(() => {
    if (loading.expand === LoadingStatus.SUCCESS) setInternalLoading(false)
  }, [loading.expand])

  return (
    <Fragment>
      <TableRow className={path.length % 2 === 0 ? classes.secondRow : ''}>
        <TableCell className={classes.expandCell} style={{ cursor: 'pointer', color: 'rgb(91, 197, 242)' }}>
          <ListItem
            className={classes.expandIcon}
            style={path.length > 1 ? { marginLeft: path.length * 24 - 24 + 'px' } : { margin: '0' }}
          >
            {canExpand && (
              <>
                {internalLoading && <CircularProgress size={'15px'} color="info" />}
                {!internalLoading && (
                  <>
                    {open && <KeyboardArrowDown onClick={() => setOpen(false)} />}
                    {!open && <KeyboardArrowRight onClick={handleOpen} />}
                  </>
                )}
              </>
            )}
          </ListItem>
        </TableCell>
        <TableCell align="center" className={classes.checkbox}>
          <Checkbox
            checked={status === SelectedStatus.SELECTED}
            indeterminate={status === SelectedStatus.INDETERMINATE}
            color="secondary"
            indeterminateIcon={<IndeterminateCheckBoxOutlined />}
            onChange={(event, checked) => onSelect(item, checked)}
            inputProps={{ 'aria-labelledby': name }}
          />
        </TableCell>
        {searchMode && full_path && (
          <TableCell>
            <Breadcrumbs maxItems={2}>
              {(full_path.split('/').length > 1 ? full_path.split('/').slice(1) : full_path.split('/').slice(0)).map(
                (full_path: string, index: number) => (
                  <Typography key={index} style={{ color: '#153D8A' }}>
                    {full_path}
                  </Typography>
                )
              )}
            </Breadcrumbs>
          </TableCell>
        )}
        {!searchMode && (
          <TableCell style={{ cursor: 'pointer' }}>
            <Typography
              onClick={() => (open ? setOpen(false) : handleOpen())}
            >{`${source_value} - ${name}`}</Typography>
          </TableCell>
        )}
        <TableCell align="center">
          <Typography onClick={() => (open ? setOpen(false) : handleOpen())}>{displayDigit(+cohort_size)}</Typography>
        </TableCell>
        <TableCell align="center">
          {item.rights && <Typography>{servicesPerimeters.getAccessFromRights(item.rights)}</Typography>}
        </TableCell>
      </TableRow>
      {!internalLoading &&
        open &&
        sort(subItems || [], 'source_value').map((subItem: Hierarchy<ScopeElement, string>, currentIndex: number) => {
          if (subItem.validity === NodeValidity.VALID)
            return (
              <ScopeTreeItem
                loading={loading}
                path={[...path, id]}
                searchMode={searchMode}
                key={currentIndex}
                item={subItem}
                onSelect={onSelect}
                onExpand={onExpand}
              />
            )
        })}
    </Fragment>
  )
}

type HierarchyProps = {
  hierarchy: Hierarchy<ScopeElement, string>[]
  searchMode: boolean
  selectAllStatus: SelectedStatus
  sourceType: SourceType
  loading: { search: LoadingStatus; expand: LoadingStatus }
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
  onSelect: (node: Hierarchy<ScopeElement, string>, toAdd: boolean) => void
  onSelectAll: (toAdd: boolean) => void
}

const ScopeTree = ({
  hierarchy,
  searchMode,
  selectAllStatus,
  sourceType,
  loading,
  onSelect,
  onSelectAll,
  onExpand
}: HierarchyProps) => {
  const { classes } = useStyles()

  return (
    <TableContainer style={{ overflowX: 'hidden', background: 'white' }}>
      <Table>
        <TableHead>
          <TableRow className={classes.tableHead}>
            <TableCell className={classes.emptyTableHeadCell}></TableCell>
            <TableCell align="center" className={classes.emptyTableHeadCell}>
              <Checkbox
                color="secondary"
                checked={selectAllStatus === SelectedStatus.SELECTED}
                indeterminate={selectAllStatus === SelectedStatus.INDETERMINATE}
                indeterminateIcon={<IndeterminateCheckBoxOutlined style={{ color: 'rgba(0,0,0,0.6)' }} />}
                onChange={(event, checked) => onSelectAll(checked)}
              />
            </TableCell>
            <TableCell align="left" className={classes.tableHeadCell}>
              Nom
            </TableCell>

            <TableCell align="center" className={classes.tableHeadCell}>
              Nombre de patients
            </TableCell>

            <TableCell align="center" className={classes.tableHeadCell}>
              {sourceType === SourceType.ALL ? 'Accès' : 'Type'}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody style={{ height: '100%' }}>
          {loading.search === LoadingStatus.SUCCESS && !hierarchy.length && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography>Aucun résultat à afficher</Typography>
              </TableCell>
            </TableRow>
          )}
          {!(loading.search === LoadingStatus.FETCHING) &&
            hierarchy.map((item) => {
              if (!item) return <h1>Missing</h1>
              return (
                <ScopeTreeItem
                  loading={loading}
                  path={[item.id]}
                  searchMode={searchMode}
                  key={item.id}
                  item={item}
                  onExpand={onExpand}
                  onSelect={onSelect}
                />
              )
            })}
        </TableBody>
      </Table>
      {loading.search === LoadingStatus.FETCHING && (
        <Grid container justifyContent="center" alignContent="center" height={500}>
          <CircularProgress />
        </Grid>
      )}
    </TableContainer>
  )
}

export default ScopeTree
