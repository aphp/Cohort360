import React, { useState } from 'react'
import _ from 'lodash'

import {
  Autocomplete,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import { IndeterminateCheckBoxOutlined } from '@mui/icons-material'

import AdvancedInputs from '../AdvancedInputs/AdvancedInputs'
import { BlockWrapper } from 'components/ui/Layout'
import CriteriaLayout from 'components/ui/CriteriaLayout'
import OccurrencesNumberInputs from '../AdvancedInputs/OccurrencesInputs/OccurrenceNumberInputs'
import SearchbarWithCheck from 'components/ui/Inputs/SearchbarWithCheck'

import { CriteriaDrawerComponentProps, CriteriaName } from 'types'
import { Comparators, DocType, DocumentDataType, RessourceType, RessourceTypeLabels } from 'types/requestCriterias'
import { SearchByTypes } from 'types/searchCriterias'

import useStyles from './styles'

const defaultComposition: Omit<DocumentDataType, 'id'> = {
  type: RessourceType.DOCUMENTS,
  title: 'Critère de document',
  search: '',
  searchBy: SearchByTypes.TEXT,
  docType: [],
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER_OR_EQUAL,
  encounterEndDate: '',
  encounterStartDate: '',
  startOccurrence: '',
  endOccurrence: '',
  isInclusive: true
}

const CompositionForm: React.FC<CriteriaDrawerComponentProps> = (props) => {
  const { criteriaData, selectedCriteria, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const [defaultValues, setDefaultValues] = useState<DocumentDataType>(
    (selectedCriteria as DocumentDataType) || defaultComposition
  )
  const [searchInputError, setSearchInputError] = useState<boolean>(false)

  const isEdition = selectedCriteria !== null ? true : false

  const _onSubmit = () => {
    onChangeSelectedCriteria(defaultValues)
  }

  const _onChangeValue = (key: string, value: any) => {
    const _defaultValues: any = defaultValues ? { ...defaultValues } : {}
    _defaultValues[key] = value
    setDefaultValues(_defaultValues)
  }

  return (
    <CriteriaLayout
      criteriaLabel={`de ${RessourceTypeLabels.DOCUMENTS.toLocaleLowerCase()}`}
      title={defaultValues.title}
      onChangeTitle={(value) => _onChangeValue('title', value)}
      isEdition={isEdition}
      goBack={goBack}
      onSubmit={_onSubmit}
      disabled={searchInputError}
      isInclusive={!!defaultValues.isInclusive}
      onChangeIsInclusive={(value) => _onChangeValue('isInclusive', value)}
      infoAlert="Tous les éléments des champs multiples sont liés par une contrainte OU"
    >
      <OccurrencesNumberInputs
        form={CriteriaName.Document}
        selectedCriteria={defaultValues}
        onChangeValue={_onChangeValue}
      />

      <FormControl variant="outlined" className={classes.inputItem}>
        <InputLabel>Rechercher dans :</InputLabel>
        <Select
          value={defaultValues.searchBy}
          onChange={(event) => _onChangeValue('searchBy', event.target.value)}
          variant="outlined"
          label="Rechercher dans :"
        >
          <MenuItem value={SearchByTypes.TEXT}>Corps du document</MenuItem>
          <MenuItem value={SearchByTypes.DESCRIPTION}>Titre du document</MenuItem>
        </Select>
      </FormControl>

      <BlockWrapper style={{ margin: '1em 1em 0' }}>
        <SearchbarWithCheck
          searchInput={defaultValues.search}
          setSearchInput={(newValue) => _onChangeValue('search', newValue)}
          placeholder="Rechercher dans les documents"
          onError={(isError) => setSearchInputError(!!isError)}
        />
      </BlockWrapper>

      <Autocomplete
        multiple
        id="criteria-doc-type-autocomplete"
        className={classes.inputItem}
        options={criteriaData.data.docTypes || []}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => _.isEqual(option, value)}
        value={defaultValues.docType || undefined}
        onChange={(e, value) => _onChangeValue('docType', value)}
        renderInput={(params) => <TextField {...params} label="Types de documents" />}
        groupBy={(doctype) => doctype.type}
        disableCloseOnSelect
        renderGroup={(docType: any) => {
          const currentDocTypeList = criteriaData.data.docTypes
            ? criteriaData.data.docTypes.filter((doc: DocType) => doc.type === docType.group)
            : []

          const currentSelectedDocTypeList = defaultValues.docType
            ? defaultValues.docType.filter((doc: DocType) => doc.type === docType.group)
            : []

          const onClick = () => {
            if (currentDocTypeList.length === currentSelectedDocTypeList.length) {
              _onChangeValue(
                'docType',
                defaultValues.docType?.filter((doc: DocType) => doc.type !== docType.group)
              )
            } else {
              _onChangeValue(
                'docType',
                _.uniqWith([...(defaultValues.docType || []), ...currentDocTypeList], _.isEqual)
              )
            }
          }

          return (
            <React.Fragment>
              <Grid container direction="row" alignItems="center">
                <Checkbox
                  indeterminate={
                    currentDocTypeList.length !== currentSelectedDocTypeList.length &&
                    currentSelectedDocTypeList.length > 0
                  }
                  checked={currentDocTypeList.length === currentSelectedDocTypeList.length}
                  onClick={onClick}
                  indeterminateIcon={<IndeterminateCheckBoxOutlined />}
                />
                <Typography onClick={onClick} noWrap style={{ cursor: 'pointer', width: 'calc(100% - 150px' }}>
                  {docType.group}
                </Typography>
              </Grid>
              {docType.children}
            </React.Fragment>
          )
        }}
      />

      <AdvancedInputs form={CriteriaName.Document} selectedCriteria={defaultValues} onChangeValue={_onChangeValue} />
    </CriteriaLayout>
  )
}

export default CompositionForm
