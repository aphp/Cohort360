import React, { useEffect, useRef, useState } from 'react'

import { Grid, Button, Typography } from '@mui/material'

import Tabs from 'components/ui/Tabs'
import { LoadingStatus, TabType } from 'types'
import { RessourceType } from 'types/requestCriterias'
import { useSearchCodes } from 'hooks/filters/useSearchCodes'
import ResearchResults from './Research/Results'
import SearchParameters from './Research/SearchParameters'

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
  const { searchParameters, codes, loadingStatus, addPage, addReferences, addSearch } = useSearchCodes(type)

  const tabsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (searchRef.current && tabsRef?.current && actionsRef.current) {
      setHeight(
        window.innerHeight -
          tabsRef.current.clientHeight -
          searchRef.current.clientHeight -
          actionsRef.current.clientHeight -
          81
      )
    }
  }, [searchRef.current, tabsRef?.current, actionsRef.current])

  return (
    <Grid container padding="40px" justifyContent="center" alignItems="">
      <Grid item xs={12} container>
        <Grid item xs={12} ref={tabsRef}>
          <Tabs
            values={tabs}
            active={activeTab}
            onchange={(value: TabType<SearchCodesTab, SearchCodesTabLabel>) => setActiveTab(value)}
          />
        </Grid>
        {activeTab.id === SearchCodesTab.RESEARCH && (
          <>
            <Grid item xs={12} ref={searchRef}>
              <SearchParameters
                references={searchParameters.references}
                onSelect={(search, references) => {
                  addSearch(search)
                  addReferences(references)
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              container
              alignItems="center"
              justifyContent="center"
              style={{
                height: height
              }}
            >
              <ResearchResults loading={loadingStatus === LoadingStatus.FETCHING} results={codes} onFetch={addPage} />
            </Grid>
          </>
        )}
      </Grid>

      <Grid item xs={12} container justifyContent="center" ref={actionsRef}>
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
  )
}

export default SearchCodes
