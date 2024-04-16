import React, { Fragment, useEffect, useState } from 'react'

import {
  Breadcrumbs,
  Checkbox,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { ScopeElement, SelectedStatus } from 'types'
import { Hierarchy, NodeValidity } from 'types/hierarchy'
import { IndeterminateCheckBoxOutlined, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material'
import servicesPerimeters from 'services/aphp/servicePerimeters'
import displayDigit from 'utils/displayDigit'
import useStyles from './styles'
import { SourceType } from 'types/scope'

type HierarchyItemProps = {
  item: Hierarchy<ScopeElement, string>
  path: string[]
  searchMode: boolean
  onSelect: (node: Hierarchy<ScopeElement, string>, toAdd: boolean) => void
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
}

const ScopeTreeItem = ({ item, path, searchMode, onSelect, onExpand }: HierarchyItemProps) => {
  const { classes } = useStyles()
  const [open, setOpen] = useState(false)
  const { id, name, subItems, status, source_value, cohort_size, full_path } = item
  const canExpand =
    !subItems || (subItems.length > -1 && !subItems.every((subItem) => subItem.validity === NodeValidity.NOT_VALID))
  const canSearch = open === true && !subItems

  useEffect(() => {
    /*if (canSearch)*/ onExpand(item)
  }, [open])

  return (
    <Fragment>
      <TableRow className={path.length % 2 === 0 ? classes.secondRow : classes.mainRow}>
        <TableCell
          width="42px"
          className={classes.expandCell}
          style={{ cursor: 'pointer', color: 'rgb(91, 197, 242)' }}
        >
          <ListItem
            className={classes.expandIcon}
            style={path.length > 1 ? { marginLeft: path.length * 24 - 24 + 'px' } : { margin: '0' }}
          >
            {canExpand && (
              <>
                {open && <KeyboardArrowDown onClick={() => setOpen(false)} />}
                {!open && <KeyboardArrowRight onClick={() => setOpen(true)} />}
              </>
            )}
          </ListItem>
        </TableCell>
        <TableCell width="42px" align="center" className={classes.checkbox}>
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
            <Typography onClick={() => setOpen(!open)}>{`${source_value} - ${name} - ${id}`}</Typography>
          </TableCell>
        )}
        <TableCell align="center">
          <Typography onClick={() => setOpen(!open)}>{displayDigit(+cohort_size)}</Typography>
        </TableCell>
        <TableCell align="center">
          {item.rights && <Typography>{servicesPerimeters.getAccessFromRights(item.rights)}</Typography>}
        </TableCell>
      </TableRow>
      {open &&
        subItems &&
        subItems.map((subItem: Hierarchy<ScopeElement, string>, currentIndex: number) => {
          if (subItem.validity === NodeValidity.VALID)
            return (
              <ScopeTreeItem
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
  onExpand: (node: Hierarchy<ScopeElement, string>) => void
  onSelect: (node: Hierarchy<ScopeElement, string>, toAdd: boolean) => void
  onSelectAll: (toAdd: boolean) => void
}

const ScopeTree = ({
  hierarchy,
  searchMode,
  selectAllStatus,
  sourceType,
  onSelect,
  onSelectAll,
  onExpand
}: HierarchyProps) => {
  const { classes } = useStyles()

  return (
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
        {hierarchy.map((item) => {
          if (!item) return <h1>Missing</h1>
          return (
            <ScopeTreeItem
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
  )
}

export default ScopeTree
