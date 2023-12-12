import React, { useState } from 'react'

import { Autocomplete, TextField } from '@mui/material'

import useStyles from './styles'

import { DurationRangeType, LabelObject, VitalStatusLabel } from 'types/searchCriterias'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { CriteriaDataKey, DemographicDataType, RessourceType, RessourceTypeLabels } from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import { CriteriaDrawerComponentProps, CriteriaItemDataCache } from 'types'
import CriteriaLayout from 'components/ui/CriteriaLayout'

enum Error {
  INCOHERENT_AGE_ERROR,
  NO_ERROR
}

export const mappingCriteria = (criteriaToMap: any, key: CriteriaDataKey, mapping: CriteriaItemDataCache) => {
  if (criteriaToMap) {
    return criteriaToMap.map((criteria: any) => {
      const mappedCriteria = mapping.data?.[key]?.find((c: any) => c?.id === criteria?.id)
      return mappedCriteria
    })
  } else {
    return []
  }
}

const DemographicForm = (props: CriteriaDrawerComponentProps) => {
  const { criteriaData, onChangeSelectedCriteria, goBack } = props
  const selectedCriteria: DemographicDataType | null = props.selectedCriteria as DemographicDataType
  const [birthdates, setBirthdates] = useState<DurationRangeType>(selectedCriteria?.birthdates || [null, null])
  const [deathDates, setDeathDates] = useState<DurationRangeType>(selectedCriteria?.deathDates || [null, null])
  const [age, setAge] = useState<DurationRangeType>(selectedCriteria?.age || [null, null])
  const [vitalStatus, setVitalStatus] =
    useState(mappingCriteria(selectedCriteria?.vitalStatus, CriteriaDataKey.VITALSTATUS, criteriaData)) || []
  const [genders, setGenders] =
    useState(mappingCriteria(selectedCriteria?.genders, CriteriaDataKey.GENDER, criteriaData)) || []
  const [title, setTitle] = useState(selectedCriteria?.title || 'Critère démographique')
  const [isInclusive, setIsInclusive] = useState<boolean>(selectedCriteria?.isInclusive || true)

  const { classes } = useStyles()

  const [error, setError] = useState(Error.NO_ERROR)
  const isEdition = selectedCriteria !== null ? true : false

  const onSubmit = () => {
    onChangeSelectedCriteria({
      id: selectedCriteria?.id,
      age,
      birthdates,
      deathDates,
      genders,
      isInclusive,
      vitalStatus,
      title,
      type: RessourceType.PATIENT
    })
  }

  return (
    <CriteriaLayout
      criteriaLabel={`de ${RessourceTypeLabels.PATIENT.toLocaleLowerCase()}`}
      title={title}
      onChangeTitle={setTitle}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={onSubmit}
      disabled={error === Error.INCOHERENT_AGE_ERROR}
      isInclusive={isInclusive}
      onChangeIsInclusive={setIsInclusive}
      infoAlert={'Tous les éléments des champs multiples sont liés par une contrainte OU'}
    >
      <Autocomplete
        multiple
        id="criteria-gender-autocomplete"
        className={classes.inputItem}
        options={criteriaData.data.gender || []}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={genders}
        onChange={(e, value) => setGenders(value)}
        renderInput={(params) => <TextField {...params} label="Genre" />}
      />

      <Autocomplete
        multiple
        id="criteria-vitalStatus-autocomplete"
        className={classes.inputItem}
        options={criteriaData.data.status}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={vitalStatus}
        onChange={(e, value) => {
          setVitalStatus(value)
          if (value.length === 1 && value[0].label === VitalStatusLabel.ALIVE) setDeathDates([null, null])
        }}
        renderInput={(params) => <TextField {...params} label="Statut vital" />}
      />

      <BlockWrapper margin="1em">
        <CalendarRange
          inline
          disabled={age[0] !== null || age[1] !== null}
          value={birthdates}
          label={'Date de naissance'}
          onChange={(value) => setBirthdates(value)}
          onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
        />
      </BlockWrapper>

      <BlockWrapper margin="1em">
        <DurationRange
          value={age}
          disabled={birthdates[0] !== null || birthdates[1] !== null}
          label={
            vitalStatus &&
            vitalStatus.length === 1 &&
            vitalStatus.find((status: LabelObject) => status.label === VitalStatusLabel.DECEASED)
              ? 'Âge au décès'
              : 'Âge actuel'
          }
          onChange={(value) => setAge(value)}
          onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
        />
      </BlockWrapper>
      {vitalStatus &&
            (vitalStatus.length === 0 ||
              (vitalStatus.length === 1 &&
                vitalStatus.find((status: LabelObject) => status.label === VitalStatusLabel.DECEASED))) && (
          <BlockWrapper margin="1em">
            <CalendarRange
              inline
              value={deathDates}
              label={'Date de décès'}
              onChange={(value) => setDeathDates(value)}
              onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
            />
          </BlockWrapper>
        )}
    </CriteriaLayout>
  )
}

export default DemographicForm
