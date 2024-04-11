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
import { Reference } from 'types/searchCodes'
import SelectedCodes from './SelectedCodes'

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
  const { search, hierarchy, selectedCodes, selectedIds } = useCodes(references)

  return (
    <Grid container style={{ height: '100vh' }}>
      <Grid item xs={12} container padding="5vh 40px">
        <Grid item xs={12} style={{ height: '5vh' }}>
          <Tabs
            values={tabs}
            active={activeTab}
            onchange={(value: TabType<SearchCodesTab, SearchCodesTabLabel>) => setActiveTab(value)}
          />
          <Divider />
        </Grid>
        {activeTab.id === SearchCodesTab.RESEARCH && (
          <>
            <Grid container style={{ height: '25vh' }}>
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
                height: '48vh',
                filter: search.searchParameters.loadingStatus === LoadingStatus.FETCHING ? 'blur(8px)' : 'blur(0px)'
              }}
            >
              <ResearchResults
                results={search.codes}
                selected={selectedIds}
                onFetch={search.handleFetchNext}
                onSelect={search.selectResearchCodes}
                // onSelectAll={handleFetchAll}
              />
            </Grid>
          </>
        )}
        {activeTab.id === SearchCodesTab.HIERARCHY && (
          <>
            <Grid item xs={12} style={{ height: '15vh' }}>
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
                height: '58vh',
                filter: hierarchy.searchParameters.loadingStatus === LoadingStatus.FETCHING ? 'blur(8px)' : 'blur(0px)'
              }}
            >
              <Hierarchy
                onSelect={hierarchy.selectHierarchyCodes}
                results={hierarchy.codes}
                onExpand={hierarchy.expandHierarchy}
              />
            </Grid>
          </>
        )}
      </Grid>
      <Grid
        item
        xs={12}
        style={{ backgroundColor: '#E6F1FD', height: '12vh' }}
        padding="20px 40px 0px 40px"
        // style={{ position: 'absolute', bottom: 0, left: 0, padding: '20px 40px', backgroundColor: '#E6F1FD' }}
      >
        <SelectedCodes values={selectedCodes} onDelete={() => {}} />
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
