import React, { Fragment, useEffect, useState } from 'react'

import { Collapse, List, ListItem, ListItemIcon, ListItemText, Skeleton, Tooltip } from '@mui/material'

import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import useStyles from '../../CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/MedicationForm/components/Hierarchy/styles'
import { PmsiListType } from 'state/pmsi'
import { Back_API_Response, HierarchyElementWithSystem } from 'types'

type HierarchyItemProps = {
  item: HierarchyElementWithSystem
  selectedItems?: HierarchyElementWithSystem[] | null
  allItems: HierarchyElementWithSystem[] | null
  indexs: number[]
  handleClick: (medicationItem: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => void
  onExpand: (parentCode: string, index: number[]) => void
}

const HierarchyItem = ({ item, allItems, selectedItems, indexs, handleClick, onExpand }: HierarchyItemProps) => {
  const { classes, cx } = useStyles()
  const [open, setOpen] = useState(false)
  const { id, label, subItems } = item

  //const isSelected = findSelectedInListAndSubItems(selectedItems || [], item, allItems || [], valueSetSystem)
  //const isIndeterminated = checkIfIndeterminated(item, selectedItems)

  const handleExpand = async (parentCode: string) => {
    onExpand(parentCode, indexs)
  }

  useEffect(() => {
    console.log('test after expand', item.subItems)
    /* console.log('test new subItem', item?.subItems[0]?.id)
    if (item.subItems && item.subItems?.length && item.subItems[0].id != 'loading') {
      const sorted = item.subItems.sort((a, b) => a.label.localeCompare(b.label))
      setTest({ ...item, subItems: sorted })
    }*/
  }, [item])

  useEffect(() => {
    if (open === true && subItems?.length && subItems[0].id === 'loading') handleExpand(id)
  }, [open])

  return (
    <>
      <ListItem className={classes.medicationItem} style={{ cursor: 'pointer' }}>
        <ListItemIcon>
          <div
            onClick={() => /*handleClickOnHierarchy(item)*/ {}}
            className={cx(
              classes.indicator /*{
              [classes.selectedIndicator]: isSelected,
              [classes.indeterminateIndicator]: isSelected ? false : isIndeterminated
            }*/
            )}
            style={{ color: '#0063af' }}
          />
        </ListItemIcon>
        <Tooltip title={label} enterDelay={2500}>
          <ListItemText onClick={() => setOpen(!open)} primary={label} />
        </Tooltip>
        {subItems?.length && open ? <ExpandLess onClick={() => setOpen(false)} /> : <Fragment />}
        {subItems?.length && !open ? <ExpandMore onClick={() => setOpen(true)} /> : <Fragment />}
      </ListItem>
      <Collapse in={indexs.length === 1 || open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding className={classes.subItemsContainer}>
          <div className={classes.subItemsContainerIndicator} />
          {subItems &&
            subItems.map((subItem: any, currentIndex: number) =>
              subItem.id === 'loading' ? (
                <Fragment key={currentIndex}>
                  <div className={classes.subItemsIndicator} />
                  <Skeleton style={{ flex: 1, margin: '2px 32px' }} height={32} />
                </Fragment>
              ) : (
                <Fragment key={currentIndex}>
                  <div className={classes.subItemsIndicator} />
                  <HierarchyItem
                    indexs={[...indexs, currentIndex]}
                    allItems={allItems}
                    item={subItem}
                    selectedItems={selectedItems}
                    handleClick={handleClick}
                    onExpand={onExpand}
                  />
                </Fragment>
              )
            )}
        </List>
      </Collapse>
    </>
  )
}

type HierarchyProps = {
  results: Back_API_Response<HierarchyElementWithSystem>
  onExpand: (parentCode: string, index: number[]) => void
  onSelect: (data: PmsiListType[] | null | undefined, newHierarchy?: PmsiListType[]) => void
}

const Hierarchy = ({ results, onSelect, onExpand }: HierarchyProps) => {
  const { classes } = useStyles()
  const [sortedHierarchy, setSortedHierarchy] = useState(results.results || [])
  console.log("test render")

    useEffect(() => {
       console.log('test new subItem', item?.subItems[0]?.id)
    if (sortedHierarchy.subItems && item.subItems?.length && item.subItems[0].id != 'loading') {
      const sorted = item.subItems.sort((a, b) => a.label.localeCompare(b.label))
      setSortedHierarchy({ ...item, subItems: sorted })
    }
    }, [sortedHierarchy])


  return (
    <List component="nav" aria-labelledby="nested-list-subheader" className={classes.drawerContentContainer}>
      {(results?.results || []).map((item, index) => (
        <HierarchyItem
          indexs={[0]}
          key={index}
          item={item}
          allItems={results.results!}
          onExpand={onExpand}
          // selectedItems={currentState.code}
          handleClick={/*_handleClick*/ () => {}}
        />
      ))}
    </List>
  )
}

export default Hierarchy
