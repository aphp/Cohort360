import React, { useEffect, useState } from 'react'

import { Autocomplete, TextField, Tooltip } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'

import useStyles from './styles'

import { CriteriaDrawerComponentProps, CriteriaName, ScopeTreeRow } from 'types'
import PopulationCard from '../../../../PopulationCard/PopulationCard'
import { STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE } from 'utils/cohortCreation'
import { DurationRangeType, LabelObject } from 'types/searchCriterias'
import {
  Comparators,
  CriteriaDataKey,
  EncounterDataType,
  RessourceType,
  RessourceTypeLabels
} from 'types/requestCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import Collapse from 'components/ui/Collapse'
import CalendarRange from 'components/ui/Inputs/CalendarRange'
import DurationRange from 'components/ui/Inputs/DurationRange'
import { mappingCriteria } from '../DemographicForm'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import OccurrencesNumberInputs from '../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import { FormLabelWrapper } from 'components/ui/Form'

enum Error {
  EMPTY_FORM,
  EMPTY_DURATION_ERROR,
  EMPTY_AGE_ERROR,
  MIN_MAX_AGE_ERROR,
  MIN_MAX_DURATION_ERROR,
  INCOHERENT_DURATION_ERROR,
  INCOHERENT_AGE_ERROR,
  INCOHERENT_DURATION_ERROR_AND_INCOHERENT_AGE_ERROR,
  NO_ERROR
}

const EncounterForm = ({
  criteriaData,
  selectedCriteria,
  goBack,
  onChangeSelectedCriteria
}: CriteriaDrawerComponentProps) => {
  const criteria = selectedCriteria as EncounterDataType
  const [title, setTitle] = useState(criteria?.title || 'Critère de prise en charge')
  const [age, setAge] = useState<DurationRangeType>(criteria?.age || [null, null])
  const [duration, setDuration] = useState<DurationRangeType>(criteria?.duration || [null, null])
  const [admissionMode, setAdmissionMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.admissionMode, CriteriaDataKey.ADMISSION_MODE, criteriaData) || []
  )
  const [entryMode, setEntryMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.entryMode, CriteriaDataKey.ENTRY_MODES, criteriaData) || []
  )
  const [exitMode, setExitMode] = useState<LabelObject[]>(
    mappingCriteria(criteria?.exitMode, CriteriaDataKey.EXIT_MODES, criteriaData) || []
  )
  const [priseEnChargeType, setPriseEnChargeType] = useState<LabelObject[]>(
    mappingCriteria(criteria?.priseEnChargeType, CriteriaDataKey.PRISE_EN_CHARGE_TYPE, criteriaData) || []
  )
  const [typeDeSejour, setTypeDeSejour] = useState<LabelObject[]>(
    mappingCriteria(criteria?.typeDeSejour, CriteriaDataKey.TYPE_DE_SEJOUR, criteriaData) || []
  )
  const [fileStatus, setFileStatus] = useState<LabelObject[]>(
    mappingCriteria(criteria?.fileStatus, CriteriaDataKey.FILE_STATUS, criteriaData) || []
  )
  const [reason, setReason] = useState<LabelObject[]>(
    mappingCriteria(criteria?.reason, CriteriaDataKey.REASON, criteriaData) || []
  )
  const [destination, setDestination] = useState<LabelObject[]>(
    mappingCriteria(criteria?.destination, CriteriaDataKey.DESTINATION, criteriaData) || []
  )
  const [provenance, setProvenance] = useState<LabelObject[]>(
    mappingCriteria(criteria?.provenance, CriteriaDataKey.PROVENANCE, criteriaData) || []
  )
  const [admission, setAdmission] = useState<LabelObject[]>(
    mappingCriteria(criteria?.admission, CriteriaDataKey.ADMISSION, criteriaData) || []
  )
  const [encounterService, setEncounterService] = useState<ScopeTreeRow[]>(criteria?.encounterService || [])
  const [encounterStartDate, setEncounterStartDate] = useState<string | null | undefined>(
    criteria?.encounterStartDate || null
  )
  const [encounterEndDate, setEncounterEndDate] = useState<string | null | undefined>(
    criteria?.encounterEndDate || null
  )
  const [occurrence, setOccurrence] = useState<number>(criteria?.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState<Comparators>(
    criteria?.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )
  const [isInclusive, setIsInclusive] = useState<boolean>(criteria?.isInclusive || true)

  const { classes } = useStyles()
  const isEdition = selectedCriteria !== null ? true : false
  const [error, setError] = useState(Error.NO_ERROR)

  const _onChangeValue = (key: string, value: any) => {
    switch (key) {
      case 'occurrenceComparator':
        setOccurrenceComparator(value)
        break
      case 'occurrence':
        setOccurrence(value)
        break
      default:
        break
    }
  }

  useEffect(() => {
    setError(Error.NO_ERROR)
    if (
      (occurrence === 0 && occurrenceComparator === Comparators.EQUAL) ||
      (occurrence === 1 && occurrenceComparator === Comparators.LESS) ||
      (occurrence === 0 && occurrenceComparator === Comparators.LESS_OR_EQUAL)
    ) {
      setError(Error.EMPTY_FORM)
    }
  }, [occurrence, occurrenceComparator])

  const onSubmit = () => {
    onChangeSelectedCriteria({
      id: criteria?.id,
      age,
      duration,
      admissionMode,
      entryMode,
      exitMode,
      priseEnChargeType,
      typeDeSejour,
      fileStatus,
      reason,
      destination,
      provenance,
      admission,
      encounterService,
      encounterStartDate,
      encounterEndDate,
      occurrence,
      occurrenceComparator,
      isInclusive,
      title,
      type: RessourceType.ENCOUNTER
    })
  }
  return (
    <CriteriaLayout
      criteriaLabel={`de ${RessourceTypeLabels.ENCOUNTER.toLocaleLowerCase()}`}
      title={title}
      onChangeTitle={setTitle}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={onSubmit}
      disabled={error === Error.INCOHERENT_AGE_ERROR || error === Error.EMPTY_FORM}
      isInclusive={isInclusive}
      onChangeIsInclusive={setIsInclusive}
      infoAlert={
        error === Error.NO_ERROR ? 'Tous les éléments des champs multiples sont liés par une contrainte OU' : ''
      }
      errorAlert={
        error === Error.EMPTY_FORM ? "Merci de renseigner au moins un nombre d'occurence supérieur ou égal à 1" : ''
      }
    >
      <OccurrencesNumberInputs
        form={CriteriaName.VisitSupport}
        selectedCriteria={{ occurrenceComparator: occurrenceComparator, occurrence: occurrence }}
        onChangeValue={_onChangeValue}
      />

      <BlockWrapper className={classes.inputItem}>
        <PopulationCard
          form={CriteriaName.VisitSupport}
          label={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
          title={STRUCTURE_HOSPITALIERE_DE_PRIS_EN_CHARGE}
          executiveUnits={encounterService || []}
          isAcceptEmptySelection={true}
          isDeleteIcon={true}
          onChangeExecutiveUnits={(newValue) => setEncounterService(newValue)}
        />
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <FormLabelWrapper>
          <BlockWrapper container justifyItems="center">
            Âge au moment de la prise en charge
            <Tooltip title="La valeur par défaut sera prise en compte si le sélecteur d'âge n'a pas été modifié.">
              <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
            </Tooltip>
          </BlockWrapper>
        </FormLabelWrapper>

        <DurationRange
          value={age}
          onChange={(value) => setAge(value)}
          onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
        />
      </BlockWrapper>

      <BlockWrapper container className={classes.inputItem}>
        <FormLabelWrapper>Durée de la prise en charge</FormLabelWrapper>
        <DurationRange
          value={duration}
          unit={'Durée'}
          onChange={(value) => setDuration(value)}
          onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
        />
      </BlockWrapper>

      <BlockWrapper className={classes.inputItem}>
        <FormLabelWrapper>Date de prise en charge</FormLabelWrapper>
        <CalendarRange
          inline
          value={[encounterStartDate, encounterEndDate]}
          onChange={([start, end]) => {
            setEncounterStartDate(start)
            setEncounterEndDate(end)
          }}
          onError={(isError) => setError(isError ? Error.INCOHERENT_AGE_ERROR : Error.NO_ERROR)}
        />
      </BlockWrapper>
      <BlockWrapper className={classes.inputItem}>
        <Collapse title="Général" value={false}>
          <Autocomplete
            multiple
            id="criteria-PriseEnChargeType-autocomplete"
            options={criteriaData.data.priseEnChargeType || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={priseEnChargeType}
            onChange={(e, value) => setPriseEnChargeType(value)}
            renderInput={(params) => <TextField {...params} label="Type de prise en charge" />}
          />

          <Autocomplete
            multiple
            id="criteria-TypeDeSejour-autocomplete"
            options={criteriaData.data.typeDeSejour || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={typeDeSejour}
            onChange={(e, value) => setTypeDeSejour(value)}
            renderInput={(params) => <TextField {...params} label="Type séjour" />}
          />

          <Autocomplete
            multiple
            id="criteria-FileStatus-autocomplete"
            options={criteriaData.data.fileStatus || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={fileStatus}
            onChange={(e, value) => setFileStatus(value)}
            renderInput={(params) => <TextField {...params} label="Statut dossier" />}
          />
        </Collapse>
      </BlockWrapper>
      <BlockWrapper className={classes.inputItem}>
        <Collapse title="Admission" value={false}>
          <Autocomplete
            multiple
            id="criteria-admissionMode-autocomplete"
            options={criteriaData.data.admissionModes || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={admissionMode}
            onChange={(e, value) => setAdmissionMode(value)}
            renderInput={(params) => <TextField {...params} label="Motif Admission" />}
          />

          <Autocomplete
            multiple
            id="criteria-admission-autocomplete"
            options={criteriaData.data.admission || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={admission}
            onChange={(e, value) => setAdmission(value)}
            renderInput={(params) => <TextField {...params} label="Type Admission" />}
          />
        </Collapse>
      </BlockWrapper>
      <BlockWrapper className={classes.inputItem}>
        <Collapse title="Entrée / Sortie" value={false}>
          <Autocomplete
            multiple
            id="criteria-entryMode-autocomplete"
            options={criteriaData.data.entryModes || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={entryMode}
            onChange={(e, value) => setEntryMode(value)}
            renderInput={(params) => <TextField {...params} label="Mode entrée" />}
          />

          <Autocomplete
            multiple
            id="criteria-exitMode-autocomplete"
            options={criteriaData.data.exitModes || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={exitMode}
            onChange={(e, value) => setExitMode(value)}
            renderInput={(params) => <TextField {...params} label="Mode sortie" />}
          />

          <Autocomplete
            multiple
            id="criteria-reason-autocomplete"
            options={criteriaData.data.reason || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={reason}
            onChange={(e, value) => setReason(value)}
            renderInput={(params) => <TextField {...params} label="Type sortie" />}
          />
        </Collapse>
      </BlockWrapper>
      <BlockWrapper className={classes.inputItem}>
        <Collapse title="Destination / Provenance" value={false}>
          <Autocomplete
            multiple
            id="criteria-destination-autocomplete"
            options={criteriaData.data.destination || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={destination}
            onChange={(e, value) => setDestination(value)}
            renderInput={(params) => <TextField {...params} label="Destination" />}
          />

          <Autocomplete
            multiple
            id="criteria-provenance-autocomplete"
            options={criteriaData.data.provenance || []}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={provenance}
            onChange={(e, value) => setProvenance(value)}
            renderInput={(params) => <TextField {...params} label="Provenance" />}
          />
        </Collapse>
      </BlockWrapper>
    </CriteriaLayout>
  )
}

export default EncounterForm
