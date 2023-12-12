import React from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchClaim } from 'state/pmsi'

import { Link } from '@mui/material'
import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import InputAutocompleteAsync from 'components/Inputs/InputAutocompleteAsync/InputAutocompleteAsync'
import OccurrencesNumberInputs from '../../../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'

import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import { GhmDataType, RessourceTypeLabels } from 'types/requestCriterias'

import services from 'services/aphp'
import useStyles from './styles'

type GHMFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: GhmDataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const GhmForm: React.FC<GHMFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }

  const getGhmOptions = async (searchValue: string) => await services.cohortCreation.fetchGhmData(searchValue, false)
  const _onSubmit = () => {
    onChangeSelectedCriteria(currentState)
    dispatch(fetchClaim())
  }
  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.ghmData
          ? criteriaData.data.ghmData.find((g: any) => g.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []

  return isOpen ? (
    <CriteriaLayout
      criteriaLabel={`de ${RessourceTypeLabels.CLAIM}`}
      title={currentState.title}
      onChangeTitle={(value) => onChangeValue('title', value)}
      isEdition={isEdition}
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
        form={CriteriaName.Ghm}
        selectedCriteria={selectedCriteria}
        onChangeValue={onChangeValue}
      />

      <InputAutocompleteAsync
        multiple
        label="Codes GHM"
        variant="outlined"
        noOptionsText="Veuillez entrer un code ou un critère GHM"
        className={classes.inputItem}
        autocompleteValue={defaultValuesCode}
        autocompleteOptions={criteriaData.data.ghmData || []}
        getAutocompleteOptions={getGhmOptions}
        onChange={(e, value) => {
          onChangeValue('code', value)
        }}
      />

      <AdvancedInputs form={CriteriaName.Ghm} selectedCriteria={currentState} onChangeValue={onChangeValue} />
    </CriteriaLayout>
  ) : (
    <></>
  )
}

export default GhmForm
