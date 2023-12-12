import React from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchProcedure } from 'state/pmsi'

import { Alert } from '@mui/material'

import AdvancedInputs from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/AdvancedInputs/AdvancedInputs'
import { BlockWrapper } from 'components/ui/Layout'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import InputAutocompleteAsync from 'components/Inputs/InputAutocompleteAsync/InputAutocompleteAsync'
import RadioGroup from 'components/ui/RadioGroup'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'

import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import { CcamDataType, RessourceTypeLabels } from 'types/requestCriterias'

import services from 'services/aphp'
import useStyles from './styles'

type CcamFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: CcamDataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const CcamForm: React.FC<CcamFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }

  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchProcedure())
  }

  const getCCAMOptions = async (searchValue: string) => {
    const ccamOptions = await services.cohortCreation.fetchCcamData(searchValue, false)

    return ccamOptions && ccamOptions.length > 0 ? ccamOptions : []
  }

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.ccamData
          ? criteriaData.data.ccamData.find((g: any) => g.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []

  return isOpen ? (
    <CriteriaLayout
      criteriaLabel={`d'${RessourceTypeLabels.PROCEDURE}`}
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
        form={CriteriaName.Ccam}
        selectedCriteria={selectedCriteria}
        onChangeValue={onChangeValue}
      />

      <RadioGroup
        style={{ display: 'flex', justifyContent: 'space-around', margin: '1em 1em 0' }}
        selectedValue={currentState.type}
        items={[
          { id: 'AREM', label: 'AREM' },
          { id: 'ORBIS', label: 'ORBIS' }
        ]}
        onchange={(value) => onChangeValue('source', value)}
        row
      />

      <BlockWrapper className={classes.inputItem}>
        <Alert severity="info">
          Les données PMSI d'ORBIS sont codées au quotidien par les médecins. Les données PMSI AREM sont validées,
          remontées aux tutelles et disponibles dans le SNDS.
        </Alert>
      </BlockWrapper>

      <InputAutocompleteAsync
        multiple
        label="Codes d'actes CCAM"
        variant="outlined"
        noOptionsText="Veuillez entrer un code ou un acte CCAM"
        className={classes.inputItem}
        autocompleteValue={defaultValuesCode}
        autocompleteOptions={criteriaData.data.ccamData || []}
        getAutocompleteOptions={getCCAMOptions}
        onChange={(e, value) => onChangeValue('code', value)}
      />

      <AdvancedInputs form={CriteriaName.Ccam} selectedCriteria={currentState} onChangeValue={onChangeValue} />
    </CriteriaLayout>
  ) : (
    <></>
  )
}

export default CcamForm
