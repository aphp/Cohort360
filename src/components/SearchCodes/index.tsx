import React, { useState } from 'react'

import { Grid, Button, Divider, Typography, IconButton, SwipeableDrawer } from '@mui/material'

import Tabs from 'components/ui/Tabs'
import { LoadingStatus, TabType } from 'types'
import { RessourceType } from 'types/requestCriterias'
import { useSearchCodes } from 'hooks/filters/useSearchCodes'
import ResearchResults from './Research/Results'
import SearchParameters from './Research/SearchParameters'
import Chip from 'components/ui/Chip'
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'

enum SearchCodesTab {
  HIERARCHY,
  RESEARCH
}

enum SearchCodesTabLabel {
  HIERARCHY = 'Arborescence',
  RESEARCH = 'Recherche'
}

type SearchCodesProps = {
  type: RessourceType.MEDICATION | RessourceType.PMSI | RessourceType.OBSERVATION
  onClose: () => void
}

const SearchCodes = ({ type, onClose }: SearchCodesProps) => {
  const [activeTab, setActiveTab] = useState<TabType<SearchCodesTab, SearchCodesTabLabel>>({
    id: SearchCodesTab.HIERARCHY,
    label: SearchCodesTabLabel.HIERARCHY
  })
  const tabs: TabType<SearchCodesTab, SearchCodesTabLabel>[] = [
    { id: SearchCodesTab.HIERARCHY, label: SearchCodesTabLabel.HIERARCHY },
    { id: SearchCodesTab.RESEARCH, label: SearchCodesTabLabel.RESEARCH }
  ]
  const [openSelectedCodesDrawer, setOpenSelectedCodesDrawer] = useState(false)
  const {
    searchParameters,
    codes,
    selectedCodes,
    selectedIds,
    loadingStatus,
    handleFetchAll,
    handleFetchNext,
    addSearchParameters,
    handleSelectedCodes
  } = useSearchCodes(type)

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
              <SearchParameters references={searchParameters.references} onSelect={addSearchParameters} />
            </Grid>

            <Grid
              item
              xs={12}
              container
              style={{
                filter: loadingStatus === LoadingStatus.FETCHING ? 'blur(8px)' : 'blur(0px)'
              }}
            >
              <ResearchResults
                results={codes}
                selected={selectedIds}
                onFetch={handleFetchNext}
                onSelect={handleSelectedCodes}
                onSelectAll={handleFetchAll}
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
                      <Chip label={code.label} onDelete={() => handleSelectedCodes([code.id])} />
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
