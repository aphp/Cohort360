import React, { Fragment, useEffect, useState } from 'react'

import { Collapse, List, ListItem, ListItemIcon, ListItemText, Skeleton, Tooltip } from '@mui/material'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import useStyles from '../../CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/MedicationForm/components/Hierarchy/styles'
import { Back_API_Response, HierarchyElementWithSystem, SelectedStatus } from 'types'

type HierarchyItemProps = {
  item: HierarchyElementWithSystem
  selected: Map<string, true>
  indexs: number[]
  /*parentStatus: SelectedStatus*/
  onSelect: (path: number[]) => void
  onExpand: (parentCode: string, index: number[]) => void
}

const HierarchyItem = ({ item, selected /*, parentStatus*/, indexs, onSelect, onExpand }: HierarchyItemProps) => {
  const { classes, cx } = useStyles()
  const [open, setOpen] = useState(false)
  const { id, label, subItems, status } = item

  const handleExpand = async (parentCode: string) => {
    onExpand(parentCode, indexs)
  }

  /*useEffect(() => {
    console.log('test parentStatus updated', parentStatus)
    //setStatus(parentStatus)
    status = parentStatus
  }, [parentStatus])*/

  useEffect(() => {
    if (open === true && subItems?.length && subItems[0].id === 'loading') handleExpand(id)
  }, [open])

  return (
    <>
      <ListItem className={classes.medicationItem} style={{ cursor: 'pointer' }}>
        <ListItemIcon>
          <div
            onClick={() => onSelect(indexs)}
            className={cx(classes.indicator, {
              [classes.selectedIndicator]: status === SelectedStatus.SELECTED,
              [classes.indeterminateIndicator]: status === SelectedStatus.INDETERMINATE
            })}
            style={{ color: '#0063af' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText onClick={() => setOpen(!open)} primary={label} />
        </Tooltip>
        {indexs.length > 1 && subItems?.length && open ? <ExpandLess onClick={() => setOpen(false)} /> : <Fragment />}
        {indexs.length > 1 && subItems?.length && !open ? <ExpandMore onClick={() => setOpen(true)} /> : <Fragment />}
      </ListItem>
      <Collapse in={indexs.length === 1 || open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={classes.subItemsContainer}>
          <div className={classes.subItemsContainerIndicator} />
          {subItems &&
            subItems.map((subItem: HierarchyElementWithSystem, currentIndex: number) => {
              if (subItem.id === 'loading') {
                return (
                  <Fragment key={currentIndex}>
                    <div className={classes.subItemsIndicator} />
                    <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
                  </Fragment>
                )
              } else {
                console.log('test', status, subItem.status)
                subItem.status = status !== SelectedStatus.INDETERMINATE ? status : subItem.status
                return (
                  <Fragment key={currentIndex}>
                    <div className={classes.subItemsIndicator} />
                    <HierarchyItem
                      indexs={[...indexs, currentIndex]}
                      /*parentStatus={status}*/
                      item={subItem}
                      selected={selected}
                      onSelect={onSelect}
                      onExpand={onExpand}
                    />
                  </Fragment>
                )
              }
            })}
        </List>
      </Collapse>
    </>
  )
}

type HierarchyProps = {
  results: Back_API_Response<HierarchyElementWithSystem>
  selected: Map<string, true>
  onExpand: (parentCode: string, index: number[]) => void
  onSelect: (path: number[]) => void
}

const Hierarchy = ({ results, selected, onSelect, onExpand }: HierarchyProps) => {
  const { classes } = useStyles()

  return (
    <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
      {(results && (results.results || [])).map((item) => {
        //console.log('test', item.status)
        //const status = item.status || SelectedStatus.NOT_SELECTED
        return (
          <HierarchyItem
            //parentStatus={status}
            indexs={[0]}
            key={item.id}
            item={item}
            onExpand={onExpand}
            selected={selected}
            onSelect={onSelect}
          />
        )
      })}
    </List>
  )
}

export default Hierarchy
