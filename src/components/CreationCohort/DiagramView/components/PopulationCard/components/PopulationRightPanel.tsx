import React, { useEffect, useState } from 'react'

import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'

import { ScopeElement } from 'types'

import useStyles from './styles'
import ScopeTree from 'components/ScopeTree'
import { Grid } from '@mui/material'
import { SourceType } from 'types/scope'
import { Hierarchy } from 'types/hierarchy'

type PopulationRightPanelProps = {
  open: boolean
  title?: string
  mandatory?: boolean
  population: Hierarchy<ScopeElement, string>[]
  selectedPopulation: Hierarchy<ScopeElement, string>[]
  sourceType: SourceType
  onConfirm: (selectedPopulation: Hierarchy<ScopeElement, string>[]) => void
  onClose: () => void
}

const PopulationRightPanel = ({
  open,
  title,
  population,
  selectedPopulation,
  sourceType,
  mandatory = false,
  onConfirm,
  onClose
}: PopulationRightPanelProps) => {
  const { classes } = useStyles()
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<ScopeElement, string>[]>([])

  return (
    <Drawer
      anchor="right"
      open={open}
      PaperProps={{ style: { overflowY: 'unset', width: '650px' } }}
      onClose={onClose}
      className={classes.drawer}
    >
      <Grid container direction="column" flexWrap="nowrap" className={classes.root}>
        <Grid item container flexDirection="column" height="100%" flexWrap="nowrap" overflow="auto">
          <Grid item className={classes.drawerTitleContainer} width="100%">
            <Typography className={classes.title}>{title ?? 'Structure hospitalière'}</Typography>
          </Grid>
          <ScopeTree
            baseTree={population}
            selectedNodes={selectedPopulation}
            onSelect={setSelectedCodes}
            sourceType={sourceType}
          />
        </Grid>
        <Grid item className={classes.drawerActionContainer} width="100%">
          <Button onClick={onClose} variant="outlined">
            Annuler
          </Button>
          <Button disabled={mandatory ? selectedCodes.length === 0 : false} onClick={() => onConfirm(selectedCodes)} variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Drawer>
  )
}

export default PopulationRightPanel
