import React, { useEffect, useState } from 'react'

import {
  Alert,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'

import InfoIcon from '@mui/icons-material/Info'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'

import useStyles from './styles'
import { useAppDispatch, useAppSelector } from 'state'
import { fetchBiology } from 'state/biology'
import { CriteriaItemDataCache, CriteriaName, HierarchyTree } from 'types'
import AdvancedInputs from '../../../AdvancedInputs/AdvancedInputs'
import { ObservationDataType, Comparators } from 'types/requestCriterias'
import services from 'services/aphp'
import { BlockWrapper } from 'components/ui/Layout'
import OccurenceInput from 'components/ui/Inputs/Occurences'

type BiologyFormProps = {
  isOpen: boolean
  isEdition: boolean
  criteriaData: CriteriaItemDataCache
  selectedCriteria: ObservationDataType
  onChangeValue: (key: string, value: any) => void
  goBack: (data: any) => void
  onChangeSelectedCriteria: (data: any) => void
}

const BiologyForm: React.FC<BiologyFormProps> = (props) => {
  const { isOpen, isEdition, criteriaData, selectedCriteria, onChangeValue, onChangeSelectedCriteria, goBack } = props

  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const initialState: HierarchyTree | null = useAppSelector((state) => state.syncHierarchyTable)
  const currentState = { ...selectedCriteria, ...initialState }
  const [multiFields, setMultiFields] = useState<string | null>(localStorage.getItem('multiple_fields'))
  const [allowSearchByValue, setAllowSearchByValue] = useState(
    typeof currentState.searchByValue[0] === 'number' || typeof currentState.searchByValue[1] === 'number'
  )
  const [occurrence, setOccurrence] = useState(currentState.occurrence || 1)
  const [occurrenceComparator, setOccurrenceComparator] = useState(
    currentState.occurrenceComparator || Comparators.GREATER_OR_EQUAL
  )

  const _onSubmit = () => {
    onChangeSelectedCriteria({ ...currentState, occurrence: occurrence, occurrenceComparator: occurrenceComparator })
    dispatch(fetchBiology())
  }

  const defaultValuesCode = currentState.code
    ? currentState.code.map((code) => {
        const criteriaCode = criteriaData.data.biologyData
          ? criteriaData.data.biologyData.find((g: any) => g.id === code.id)
          : null
        return {
          id: code.id,
          label: code.label ? code.label : criteriaCode?.label ?? '?'
        }
      })
    : []

  useEffect(() => {
    const checkChildren = async () => {
      try {
        const getChildrenResp = await services.cohortCreation.fetchBiologyHierarchy(currentState.code?.[0].id)

        getChildrenResp?.length > 0 ? onChangeValue('isLeaf', false) : onChangeValue('isLeaf', true)
      } catch (error) {
        console.error('Erreur lors du check des enfants du code de biologie sélectionné', error)
      }
    }

    currentState?.code?.length === 1 && currentState?.code[0].id !== '*'
      ? checkChildren()
      : onChangeValue('isLeaf', false)
  }, [currentState?.code])

  useEffect(() => {
    if (!currentState.isLeaf) {
      setAllowSearchByValue(false)
    }
  }, [currentState.isLeaf])

  useEffect(() => {
    if (!allowSearchByValue) {
      onChangeValue('searchByValue', [null, null])
    }
  }, [allowSearchByValue])

  return isOpen ? (
    <Grid className={classes.root}>
      <Grid className={classes.actionContainer}>
        {!isEdition ? (
          <>
            <IconButton className={classes.backButton} onClick={goBack}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Divider className={classes.divider} orientation="vertical" flexItem />
            <Typography className={classes.titleLabel}>Ajouter un critère de biologie</Typography>
          </>
        ) : (
          <Typography className={classes.titleLabel}>Modifier un critère de biologie</Typography>
        )}
      </Grid>

      <Grid className={classes.formContainer}>
        {!multiFields && (
          <Alert
            severity="info"
            onClose={() => {
              localStorage.setItem('multiple_fields', 'ok')
              setMultiFields('ok')
            }}
          >
            Tous les éléments des champs multiples sont liés par une contrainte OU
          </Alert>
        )}

        <Alert severity="warning">
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </Alert>

        <Grid className={classes.inputContainer} container>
          <Typography variant="h6">Biologie</Typography>

          <TextField
            required
            className={classes.inputItem}
            id="criteria-name-required"
            placeholder="Nom du critère"
            variant="outlined"
            value={currentState.title}
            onChange={(e) => onChangeValue('title', e.target.value)}
          />

          <Grid style={{ display: 'flex' }}>
            <FormLabel
              onClick={() => onChangeValue('isInclusive', !currentState.isInclusive)}
              style={{ margin: 'auto 1em' }}
              component="legend"
            >
              Exclure les patients qui suivent les règles suivantes
            </FormLabel>
            <Switch
              id="criteria-inclusive"
              checked={!currentState.isInclusive}
              onChange={(event) => onChangeValue('isInclusive', !event.target.checked)}
              color="secondary"
            />
          </Grid>

          <BlockWrapper className={classes.inputItem}>
            <FormLabel component="legend" className={classes.durationLegend}>
              <BlockWrapper container justifyItems="center">
                Nombre d'occurrences
                <Tooltip
                  title={
                    <span>
                      Si vous choisissez un chapitre, le nombre d'occurrences ne s'applique pas sur un unique élément de
                      ce chapitre, mais sur l'ensemble des éléments de ce chapitre. <br /> Exemple: Nombre d'occurrences
                      &ge; 3 sur un chapitre signifie que l'on inclus les patients qui ont eu au moins 3 éléments de ce
                      chapitre, distincts ou non`
                    </span>
                  }
                >
                  <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
                </Tooltip>
              </BlockWrapper>
            </FormLabel>
            <OccurenceInput
              value={occurrence}
              comparator={occurrenceComparator}
              onchange={(newOccurence, newComparator) => {
                setOccurrence(newOccurence)
                setOccurrenceComparator(newComparator)
              }}
            />
          </BlockWrapper>

          <Grid className={classes.inputContainer}>
            <Typography variant="h6">Codes de biologie</Typography>

            <Grid container item style={{ margin: '1em 0px', width: 'calc(100%-2em)' }}>
              {defaultValuesCode.length > 0 ? (
                defaultValuesCode.map((valueCode, index: number) => (
                  <Chip
                    key={index}
                    style={{ margin: 3 }}
                    label={
                      <Tooltip title={valueCode.label}>
                        <Typography style={{ maxWidth: 500 }} noWrap>
                          {valueCode.label}
                        </Typography>
                      </Tooltip>
                    }
                    onDelete={() =>
                      onChangeValue(
                        'code',
                        defaultValuesCode.filter((code) => code !== valueCode)
                      )
                    }
                  />
                ))
              ) : (
                <FormLabel style={{ margin: 'auto 1em' }} component="legend">
                  Veuillez ajouter des codes de biologie via les onglets Hiérarchie ou Recherche.
                </FormLabel>
              )}
            </Grid>

            <Grid item container direction="row" alignItems="center">
              <Typography variant="h6">Recherche par valeur</Typography>
              <Tooltip
                title="Pour pouvoir rechercher par valeur, vous devez sélectionner un seul et unique analyte (élement le plus
                fin de la hiérarchie)."
              >
                <InfoIcon fontSize="small" color="primary" style={{ marginLeft: 4 }} />
              </Tooltip>
            </Grid>

            <Grid
              style={{
                display: 'grid',
                gridTemplateColumns:
                  currentState.valueComparator === Comparators.BETWEEN ? '50px 1fr 1fr 1fr' : '50px 1fr 1fr',
                alignItems: 'center',
                marginTop: '1em'
              }}
            >
              <Checkbox
                checked={allowSearchByValue}
                onClick={() => setAllowSearchByValue(!allowSearchByValue)}
                disabled={!currentState.isLeaf}
              />

              <Select
                style={{ marginRight: '1em' }}
                id="biology-value-comparator-select"
                value={currentState.valueComparator ?? Comparators.GREATER_OR_EQUAL}
                onChange={(event) => onChangeValue('valueComparator', event.target.value)}
                disabled={!allowSearchByValue}
              >
                {(Object.keys(Comparators) as (keyof typeof Comparators)[]).map((key, index) => (
                  <MenuItem key={index} value={Comparators[key]}>
                    {Comparators[key]}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                required
                lang="en-US"
                type="number"
                id="criteria-value"
                variant="outlined"
                value={currentState.searchByValue[0]}
                onChange={(e) =>
                  onChangeValue('searchByValue', [parseFloat(e.target.value), currentState.searchByValue[1]])
                }
                placeholder={currentState.valueComparator === Comparators.BETWEEN ? 'Valeur minimale' : '0'}
                disabled={!allowSearchByValue}
              />
              {currentState.valueComparator === Comparators.BETWEEN && (
                <TextField
                  required
                  inputProps={{
                    min: 1
                  }}
                  type="number"
                  id="criteria-value"
                  variant="outlined"
                  value={currentState.searchByValue[1]}
                  onChange={(e) =>
                    onChangeValue('searchByValue', [currentState.searchByValue[0], parseFloat(e.target.value)])
                  }
                  placeholder="Valeur maximale"
                  disabled={!allowSearchByValue}
                />
              )}

              {/* TODO: gérer l'erreur si valumin > valuemax */}
            </Grid>
          </Grid>

          <AdvancedInputs form={CriteriaName.Biology} selectedCriteria={currentState} onChangeValue={onChangeValue} />
        </Grid>

        <Grid className={classes.criteriaActionContainer}>
          {!isEdition && (
            <Button onClick={goBack} variant="outlined">
              Annuler
            </Button>
          )}
          <Button onClick={_onSubmit} type="submit" form="biology-form" variant="contained">
            Confirmer
          </Button>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <></>
  )
}

export default BiologyForm
