import React, { useState } from 'react'

import { Chip, CircularProgress, Grid, IconButton, Typography } from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import CloseIcon from '@mui/icons-material/Close'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Hierarchy } from 'types/hierarchy'
import { ScopeElement } from 'types'
import useStyles from './styles'
import { Rights } from 'types/scope'

export type PopulationCardPropsType = {
  label?: string
  loading: boolean
  onEditDisabled: boolean
  population: Hierarchy<ScopeElement, string>[]
  onEdit: () => void
}

const PopulationCard = ({ label, onEditDisabled, population, loading, onEdit }: PopulationCardPropsType) => {
  const [isExtended, onExtend] = useState(false)
  const { classes } = useStyles()

  if (loading)
    return (
      <div className={/*disabled ? classes.disabledPopulationCard :*/ classes.populationCard}>
        <div className={classes.centerContainer}>
          <CircularProgress />
        </div>
      </div>
    )

  return (
    <Grid
      container
      alignItems="center"
      className={/*disabled ? classes.disabledPopulationCard : */ classes.populationCard}
    >
      <Grid item xs container alignItems="center" justifyContent="flex-start" gap="8px" className={classes.leftDiv}>
        <Grid item>
          <Typography className={classes.typography} variant="h6" align="left">
            {label || 'Population source :'}
          </Typography>
        </Grid>
        <Grid item>
          {isExtended && (
            <>
              {population.map((pop, index: number) => (
                <Chip
                  // disabled={disabled}
                  className={classes.populationChip}
                  key={`${index}-${pop?.name}`}
                  label={pop?.name}
                />
              ))}
              <IconButton size="small" onClick={() => onExtend(false)}>
                <CloseIcon />
              </IconButton>
            </>
          )}
          {!isExtended && (
            <>
              {population.slice(0, 4).map((pop, index: number) =>
                pop.id !== Rights.EXPIRED ? (
                  <Chip
                    //disabled={disabled}
                    className={classes.populationChip}
                    key={`${index}-${pop.name}`}
                    label={pop.name}
                  />
                ) : (
                  <Chip
                    // disabled={disabled}
                    className={classes.populationChip}
                    key={index}
                    label={'?'}
                  />
                )
              )}
              {population.length > 4 && (
                <IconButton size="small" onClick={() => onExtend(true)}>
                  <MoreHorizIcon />
                </IconButton>
              )}
            </>
          )}
        </Grid>
      </Grid>
      <Grid item alignSelf="center">
        <IconButton className={classes.editButton} size="small" onClick={onEdit} disabled={onEditDisabled}>
          <EditIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}

export default PopulationCard
