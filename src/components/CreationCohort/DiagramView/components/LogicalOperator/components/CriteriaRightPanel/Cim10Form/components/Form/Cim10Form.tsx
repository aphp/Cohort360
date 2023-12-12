import React from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchCondition } from 'state/pmsi'

import { Autocomplete, Link, TextField } from '@mui/material'

import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import InputAutocompleteAsync from 'components/Inputs/InputAutocompleteAsync/InputAutocompleteAsync'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'

import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import { Cim10DataType, RessourceTypeLabels } from 'types/requestCriterias'

import services from 'services/aphp'
import useStyles from './styles'

type Cim10FormProps = {
  isOpen: boolean
  isEdition?: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: Cim10DataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const Cim10Form: React.FC<Cim10FormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchCondition())
  }
  const getDiagOptions = async (searchValue: string) =>
    await services.cohortCreation.fetchCim10Diagnostic(searchValue, false)

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.cim10Diagnostic
          ? criteriaData.data.cim10Diagnostic.find((c: any) => c.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []
  const defaultValuesType = currentState.diagnosticType
    ? currentState.diagnosticType.map((diagnosticType) => {
        const criteriaType = criteriaData.data.diagnosticTypes
          ? criteriaData.data.diagnosticTypes.find((g: any) => g.id === diagnosticType.id)
          : null
        return {
          id: diagnosticType.id,
          label: diagnosticType.label ? diagnosticType.label : criteriaType?.label ?? '?'
        }
      })
    : []

  return isOpen ? (
    <CriteriaLayout
      criteriaLabel={`de ${RessourceTypeLabels.CONDITION.toLocaleLowerCase()}`}
      title={currentState.title}
      onChangeTitle={(value) => onChangeValue('title', value)}
      isEdition={!!isEdition}
      goBack={goBack}
      onSubmit={_onSubmit}
      isInclusive={!!currentState.isInclusive}
      onChangeIsInclusive={(value) => onChangeValue('isInclusive', value)}
      infoAlert="Tous les éléments des champs multiples sont liés par une contrainte OU"
      warningAlert={
        <>
          Données actuellement disponibles : PMSI ORBIS. Pour plus d'informations sur les prochaines intégrations de
          données, veuillez vous référer au tableau trimestriel de disponibilité des données disponible{' '}
          <Link
            href="https://eds.aphp.fr/sites/default/files/2023-01/EDS_Disponibilite_donnees_site_EDS_202212.pdf"
            target="_blank"
            rel="noopener"
          >
            ici
          </Link>
        </>
      }
      withTabs
    >
      <OccurrencesNumberInputs
        form={CriteriaName.Cim10}
        selectedCriteria={selectedCriteria}
        onChangeValue={onChangeValue}
      />

      <InputAutocompleteAsync
        multiple
        label="Code CIM10"
        variant="outlined"
        noOptionsText="Veuillez entrer un code ou un diagnostic CIM10"
        className={classes.inputItem}
        autocompleteValue={defaultValuesCode}
        autocompleteOptions={criteriaData.data.cim10Diagnostic || []}
        getAutocompleteOptions={getDiagOptions}
        onChange={(e, value) => {
          onChangeValue('code', value)
        }}
      />
      <Autocomplete
        multiple
        id="criteria-cim10-type-autocomplete"
        className={classes.inputItem}
        options={criteriaData.data.diagnosticTypes || []}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        value={defaultValuesType}
        onChange={(e, value) => onChangeValue('diagnosticType', value)}
        renderInput={(params) => <TextField {...params} label="Type de diagnostic" />}
      />
      <AdvancedInputs form={CriteriaName.Cim10} selectedCriteria={currentState} onChangeValue={onChangeValue} />
    </CriteriaLayout>
  ) : (
    <></>
  )
}

export default Cim10Form
