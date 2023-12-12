import React from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchMedication } from 'state/medication'

import { Autocomplete, TextField } from '@mui/material'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import InputAutocompleteAsync from 'components/Inputs/InputAutocompleteAsync/InputAutocompleteAsync'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import RadioGroup from 'components/ui/RadioGroup'

import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import { MedicationDataType, MedicationTypeLabel, RessourceType, RessourceTypeLabels } from 'types/requestCriterias'

import services from 'services/aphp'
import useStyles from './styles'

type MedicationFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: MedicationDataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const MedicationForm: React.FC<MedicationFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }

  const getMedicationOptions = async (searchValue: string) =>
    await services.cohortCreation.fetchMedicationData(searchValue, false)

  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchMedication())
  }

  if (criteriaData?.data?.prescriptionTypes === 'loading' || criteriaData?.data?.administrations === 'loading') {
    return <></>
  }

  const selectedCriteriaPrescriptionType = currentState.prescriptionType
    ? currentState.prescriptionType.map((prescriptionType) => {
        const criteriaPrescriptionType = criteriaData.data.prescriptionTypes
          ? criteriaData.data.prescriptionTypes.find((p: any) => p.id === prescriptionType.id)
          : null
        return {
          id: prescriptionType.id,
          label: prescriptionType.label ? prescriptionType.label : criteriaPrescriptionType?.label ?? '?'
        }
      })
    : []

  const selectedCriteriaAdministration = currentState.administration
    ? currentState.administration.map((administration) => {
        const criteriaAdministration = criteriaData.data.administrations
          ? criteriaData.data.administrations.find((p: any) => p.id === administration.id)
          : null
        return {
          id: administration.id,
          label: administration.label ? administration.label : criteriaAdministration?.label ?? '?'
        }
      })
    : []

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code: any) => {
        const criteriaCode = criteriaData.data.medicationData
          ? criteriaData.data.medicationData.find((g: any) => g.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?',
          system: code.system ? code.system : criteriaCode?.system ?? '?'
        }
      })
    : []

  return isOpen ? (
    <CriteriaLayout
      criteriaLabel={`de ${RessourceTypeLabels.MEDICATION.toLocaleLowerCase()}`}
      title={currentState.title}
      onChangeTitle={(value) => onChangeValue('title', value)}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={_onSubmit}
      isInclusive={!!currentState.isInclusive}
      onChangeIsInclusive={(value) => onChangeValue('isInclusive', value)}
      infoAlert="Tous les éléments des champs multiples sont liés par une contrainte OU"
      withTabs
    >
      <OccurrencesNumberInputs
        form={CriteriaName.Medication}
        selectedCriteria={currentState}
        onChangeValue={onChangeValue}
      />

      <RadioGroup
        style={{ display: 'flex', justifyContent: 'space-around', margin: '1em 1em 0' }}
        selectedValue={currentState.type}
        items={[
          { id: RessourceType.MEDICATION_REQUEST, label: MedicationTypeLabel.Request },
          { id: RessourceType.MEDICATION_ADMINISTRATION, label: MedicationTypeLabel.Administration }
        ]}
        onchange={(value) => onChangeValue('type', value)}
        row
      />

      <InputAutocompleteAsync
        multiple
        label="Code(s) sélectionné(s)"
        variant="outlined"
        noOptionsText="Veuillez entrer un code de médicament"
        className={classes.inputItem}
        autocompleteValue={defaultValuesCode}
        autocompleteOptions={criteriaData.data.medicationData || []}
        getAutocompleteOptions={getMedicationOptions}
        onChange={(e, value) => {
          onChangeValue('code', value)
        }}
      />
      {currentState.type === 'MedicationRequest' && (
        <Autocomplete
          multiple
          id="criteria-prescription-type-autocomplete"
          className={classes.inputItem}
          options={criteriaData?.data?.prescriptionTypes || []}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={selectedCriteriaPrescriptionType}
          onChange={(e, value) => onChangeValue('prescriptionType', value)}
          renderInput={(params) => <TextField {...params} label="Type de prescription" />}
        />
      )}
      <Autocomplete
        multiple
        id="criteria-prescription-type-autocomplete"
        className={classes.inputItem}
        options={criteriaData.data.administrations || []}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={selectedCriteriaAdministration}
        onChange={(e, value) => onChangeValue('administration', value)}
        renderInput={(params) => <TextField {...params} label="Voie d'administration" />}
      />
      <AdvancedInputs form={CriteriaName.Medication} selectedCriteria={currentState} onChangeValue={onChangeValue} />
    </CriteriaLayout>
  ) : (
    <></>
  )
}

export default MedicationForm
