import React, { useState } from 'react'

import { Grid, Button, Divider, Typography, IconButton } from '@mui/material'

import Tabs from 'components/ui/Tabs'
import { LoadingStatus, TabType } from 'types'
import { useCodes } from 'hooks/filters/useSearchCodes'
import ResearchResults from './Research'
import SearchParameters from './SearchParameters'
import Chip from 'components/ui/Chip'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import ReferencesParameters, { Type } from './References'
import Hierarchy from './Hierarchy'
/*import { defaultMedication } from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/MedicationForm'*/
import { Reference } from 'types/searchCodes'

enum SearchCodesTab {
  HIERARCHY,
  RESEARCH
}

enum SearchCodesTabLabel {
  HIERARCHY = 'Arborescence',
  RESEARCH = 'Recherche'
}

type SearchCodesProps = {
  references: Reference[]
  onClose: () => void
}

const SearchCodes = ({ references, onClose }: SearchCodesProps) => {
  const [activeTab, setActiveTab] = useState<TabType<SearchCodesTab, SearchCodesTabLabel>>({
    id: SearchCodesTab.HIERARCHY,
    label: SearchCodesTabLabel.HIERARCHY
  })
  const tabs: TabType<SearchCodesTab, SearchCodesTabLabel>[] = [
    { id: SearchCodesTab.HIERARCHY, label: SearchCodesTabLabel.HIERARCHY },
    { id: SearchCodesTab.RESEARCH, label: SearchCodesTabLabel.RESEARCH }
  ]
  const [openSelectedCodesDrawer, setOpenSelectedCodesDrawer] = useState(false)
  const { search, hierarchy, selectedCodes, selectedIds } = useCodes(references)

  return (
    <Grid container justifyContent="space-between">
      <Grid item xs={12} container padding="40px">
        <Grid item xs={12} marginBottom={1}>
          <Tabs
            values={tabs}
            active={activeTab}
            onchange={(value: TabType<SearchCodesTab, SearchCodesTabLabel>) => setActiveTab(value)}
          />
          <Divider />
        </Grid>
        {activeTab.id === SearchCodesTab.RESEARCH && (
          <>
            <Grid item xs={12} marginBottom={4}>
              <SearchParameters
                references={search.searchParameters.references}
                onSelectSearch={search.addSearchInputParameter}
                onSelectReferences={search.addReferencesParameter}
              />
            </Grid>

            <Grid
              item
              xs={12}
              container
              style={{
                filter: search.searchParameters.loadingStatus === LoadingStatus.FETCHING ? 'blur(8px)' : 'blur(0px)'
              }}
            >
              <ResearchResults
                results={search.codes}
                selected={selectedIds}
                onFetch={search.handleFetchNext}
                onSelect={search.handleSelectedCodes}
                // onSelectAll={handleFetchAll}
              />
            </Grid>
          </>
        )}
        {activeTab.id === SearchCodesTab.HIERARCHY && (
          <>
            <Grid item xs={12} marginBottom={2}>
              <ReferencesParameters
                onSelect={hierarchy.addReferencesParameter}
                type={Type.SINGLE}
                values={hierarchy.searchParameters.references}
              />
            </Grid>

            <Grid
              item
              xs={12}
              container
              style={{
                filter: hierarchy.searchParameters.loadingStatus === LoadingStatus.FETCHING ? 'blur(8px)' : 'blur(0px)'
              }}
            >
              <Hierarchy
                onSelect={() => {}}
                /*selectedCriteria={defaultMedication}*/ results={hierarchy.codes}
                onExpand={hierarchy.expandHierarchy}
              />
            </Grid>
          </>
        )}
      </Grid>

      <Grid
        item
        xs={12}
        container
        style={{ position: 'absolute', bottom: 0, left: 0, padding: '20px 40px', backgroundColor: '#E6F1FD' }}
      >
        {openSelectedCodesDrawer && (
          <Grid
            item
            container
            xs={12}
            justifyContent="space-between"
            marginBottom={2}
            style={{ maxHeight: 200, overflowX: 'hidden', overflowY: 'auto' }}
          >
            {selectedCodes?.length > 0 && (
              <Grid item xs={12} container marginBottom={3} spacing={1}>
                {selectedCodes
                  .filter((code) => code.label)
                  .map((code) => (
                    <Grid item xs={4} container key={code.id}>
                      <Chip label={code.label} onDelete={() => search.handleSelectedCodes([code.id])} />
                    </Grid>
                  ))}
              </Grid>
            )}
          </Grid>
        )}
        <Grid item container xs={12} justifyContent="space-between" marginBottom={2}>
          <Grid item xs={4} container>
            <Typography textAlign="center" fontWeight={900}>
              {selectedCodes?.length} sélectionné(s)
            </Typography>
          </Grid>
          <Grid item xs={1} container justifyContent="flex-end">
            {selectedCodes.length > 0 && (
              <IconButton onClick={() => setOpenSelectedCodesDrawer(!openSelectedCodesDrawer)}>
                {openSelectedCodesDrawer ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
              </IconButton>
            )}
          </Grid>
        </Grid>
        <Grid item container xs={12} justifyContent="center">
          <Grid item xs={4} container>
            <Grid item xs={6}>
              <Button onClick={onClose} variant="outlined">
                Annuler
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={onClose} variant="contained">
                Confimer
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SearchCodes
