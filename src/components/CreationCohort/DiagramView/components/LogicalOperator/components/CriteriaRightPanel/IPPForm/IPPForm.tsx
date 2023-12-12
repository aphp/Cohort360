import React, { useEffect, useState } from 'react'

import { Grid, Typography, TextField } from '@mui/material'
import CriteriaLayout from 'components/ui/CriteriaLayout'

import { CriteriaDrawerComponentProps } from 'types'
import { IPPListDataType, RessourceType, RessourceTypeLabels } from 'types/requestCriterias'

import useStyles from './styles'

const defaultIPPList: Omit<IPPListDataType, 'id'> = {
  title: "Liste d'IPP",
  type: RessourceType.IPP_LIST,
  search: '',
  isInclusive: true
}

const IPPForm: React.FC<CriteriaDrawerComponentProps> = (props) => {
  const { selectedCriteria, goBack, onChangeSelectedCriteria } = props

  const { classes } = useStyles()

  const [error, setError] = useState(false)
  const [defaultValues, setDefaultValues] = useState<IPPListDataType>(
    (selectedCriteria as IPPListDataType) || defaultIPPList
  )
  const [ippList, setIppList] = useState<string[]>([])

  const isEdition = selectedCriteria !== null ? true : false

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues: any = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues as IPPListDataType)
  }

  const _onSubmit = () => {
    if (defaultValues && defaultValues.search?.length === 0) {
      return setError(true)
    }

    const _defaultValues = { ...defaultValues, search: ippList.join() }
    onChangeSelectedCriteria(_defaultValues)
  }

  useEffect(() => {
    const ippMatches = (defaultValues.search || '').matchAll(/(?:^|\D+)*(8\d{9})(?:\D+|$)/gm) || []

    const ippList = []

    for (const match of ippMatches) {
      ippList.push(match[1])
    }

    setIppList(ippList)

    if (ippList.length > 0) {
      setError(false)
    } else {
      setError(true)
    }
  }, [defaultValues.search])

  return (
    <CriteriaLayout
      criteriaLabel={`de ${RessourceTypeLabels.IPP_LIST}`}
      title={defaultValues.title}
      onChangeTitle={(value) => _onChangeValue('title', value)}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={_onSubmit}
      disabled={error}
      isInclusive={!!defaultValues.isInclusive}
      onChangeIsInclusive={(value) => _onChangeValue('isInclusive', value)}
      errorAlert={error ? 'Merci de renseigner au moins un IPP' : ''}
    >
      <Typography className={classes.inputItem} style={{ fontWeight: 'bold' }}>
        {ippList.length} IPP détectés.
      </Typography>

      <Grid item xs={12} className={classes.inputItem}>
        <TextField
          id="outlined-basic"
          label=""
          placeholder="Ajouter une liste d'IPP"
          variant="outlined"
          onChange={(event) => _onChangeValue('search', event.target.value)}
          multiline
          minRows={5}
          style={{ width: '100%' }}
        />
      </Grid>
    </CriteriaLayout>
  )
}

export default IPPForm
