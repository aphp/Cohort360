import { fetchValueSet } from 'services/aphp/callApi'
import { MEDICATION_UCD_13 } from '../../constants'
import { MEDICATION_ATC } from '../../constants'
import { MEDICATION_UCD } from '../../constants'
import { useEffect, useMemo, useRef, useState } from 'react'
import { RessourceType } from 'types/requestCriterias'
import { Reference, References, ReferencesLabel, SearchParameters } from 'types/searchCodes'
import { cancelPendingRequest } from 'utils/abortController'
import { Back_API_Response, HierarchyElementWithSystem, LoadingStatus } from 'types'
import { Direction, Order } from 'types/searchCriterias'

const DEFAULT_LIMIT = 20

const getMedicationSearchCodes = (): SearchParameters => {
  return {
    type: RessourceType.MEDICATION,
    limit: DEFAULT_LIMIT,
    page: 0,
    search: '',
    orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC },
    references: [
      { id: References.ATC, label: ReferencesLabel.ATC, standard: true, url: `${MEDICATION_ATC}`, checked: true },
      { id: References.UCD, label: ReferencesLabel.UCD, standard: true, url: `${MEDICATION_UCD}`, checked: true },
      {
        id: References.UCD_13,
        label: ReferencesLabel.UCD_13,
        standard: false,
        url: `${MEDICATION_UCD_13}`,
        checked: false
      }
    ]
  }
}
const initSearchParameters = (
  type: RessourceType.MEDICATION | RessourceType.OBSERVATION | RessourceType.PMSI
): SearchParameters => {
  switch (type) {
    case RessourceType.MEDICATION:
      return getMedicationSearchCodes()
  }
  return getMedicationSearchCodes()
}

type FetchParams = {
  noLimit?: boolean
}

export const useSearchCodes = (type: RessourceType.PMSI | RessourceType.OBSERVATION | RessourceType.MEDICATION) => {
  const [searchParameters, setSearchParameters] = useState(initSearchParameters(type))
  const [codes, setCodes] = useState<Back_API_Response<HierarchyElementWithSystem>>({})
  const [selectedCodes, setSelectedCodes] = useState<HierarchyElementWithSystem[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)

  const handleSelectedCodes = (ids: string[]) => {
    const newSelectedCodes = [...selectedCodes]
    ids.forEach((id) => {
      const existingIndex = newSelectedCodes.findIndex((code) => code.id === id)
      if (existingIndex > -1) {
        newSelectedCodes.splice(existingIndex, 1)
      } else {
        const codeToAdd = (codes.results || []).find((code) => code.id === id)
        if (codeToAdd) {
          newSelectedCodes.push(codeToAdd)
        }
      }
    })
    setSelectedCodes(newSelectedCodes)
  }
  const addSearchParameters = (search: string, references: Reference[]) => {
    const newReferences = searchParameters.references.map((stateRef) => ({
      ...stateRef,
      checked: references.find((newRef) => newRef.id === stateRef.id)?.checked || false
    }))
    setSearchParameters({ ...searchParameters, references: newReferences, search })
  }

  const handleFetchAll = () => {
    fetchCodes({ noLimit: true })
    setSelectAll(true)
  }

  const handleFetchNext = () => {
    setSearchParameters({ ...searchParameters, page: searchParameters.page + 1 })
  }

  const fetchCodes = async (fetchParams?: FetchParams) => {
    setLoadingStatus(LoadingStatus.FETCHING)
    const codeSystem = searchParameters.references
      .filter((ref) => ref.checked)
      .map((ref) => ref.url)
      .join(',')
    const limit = fetchParams?.noLimit ? 0 : searchParameters.limit
    try {
      const response = await fetchValueSet(
        codeSystem,
        {
          search: searchParameters.search,
          exactSearch: false,
          offset: searchParameters.page * limit,
          count: limit,
          orderBy: searchParameters.orderBy
        },
        controllerRef.current?.signal
      )
      if (searchParameters.page > 0 && !fetchParams?.noLimit) {
        setCodes({
          ...response,
          results: [...(codes?.results || []), ...(response.results || [])]
        })
      } else {
        setCodes(response)
      }
    } catch {
      setCodes({ results: [], count: 0 })
    } finally {
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
  }

  const selectedIds = useMemo<Map<string, true>>(() => {
    return selectedCodes.reduce((map, code) => {
      map.set(code.id, true)
      return map
    }, new Map())
  }, [selectedCodes])

  useEffect(() => {
    setSearchParameters({ ...searchParameters, page: 0 })
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [searchParameters.search, searchParameters.references, searchParameters.orderBy, searchParameters.limit])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [searchParameters.page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchCodes()
    }
  }, [loadingStatus])

  return {
    searchParameters,
    codes,
    selectedCodes,
    selectedIds,
    loadingStatus,
    handleFetchAll,
    handleFetchNext,
    addSearchParameters,
    handleSelectedCodes
  }
}
