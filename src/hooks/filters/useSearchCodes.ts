import { fetchValueSet } from 'services/aphp/callApi'
import { MEDICATION_UCD_13 } from '../../constants'
import { MEDICATION_ATC } from '../../constants'
import { MEDICATION_UCD } from '../../constants'
import { useEffect, useRef, useState } from 'react'
import { RessourceType } from 'types/requestCriterias'
import { Reference, References, ReferencesLabel, SearchParameters } from 'types/searchCodes'
import { cancelPendingRequest } from 'utils/abortController'
import { Back_API_Response, HierarchyElementWithSystem, LoadingStatus } from 'types'
import { Direction, Order } from 'types/searchCriterias'

const getMedicationSearchCodes = (): SearchParameters => {
  return {
    type: RessourceType.MEDICATION,
    page: 0,
    offset: 20,
    search: '',
    orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC },
    references: [
      { id: References.ATC, label: ReferencesLabel.ATC, standard: true, url: `${MEDICATION_ATC}` },
      { id: References.UCD, label: ReferencesLabel.UCD, standard: true, url: `${MEDICATION_UCD}` },
      { id: References.UCD_13, label: ReferencesLabel.UCD_13, standard: false, url: `${MEDICATION_UCD_13}` }
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

export const useSearchCodes = (type: RessourceType.PMSI | RessourceType.OBSERVATION | RessourceType.MEDICATION) => {
  const [searchParameters, setSearchParameters] = useState(initSearchParameters(type))
  const [codes, setCodes] = useState<Back_API_Response<HierarchyElementWithSystem>>({})
  const controllerRef = useRef<AbortController | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.IDDLE)

  const addPage = () => {
    setSearchParameters({ ...searchParameters, page: searchParameters.page + 1 })
    setLoadingStatus(LoadingStatus.IDDLE)
  }

  const addSearch = (search: string) => {
    setSearchParameters({ ...searchParameters, search })
    setLoadingStatus(LoadingStatus.IDDLE)
  }

  const addReferences = (references: Reference[]) => {
    setSearchParameters({ ...searchParameters, references })
    setLoadingStatus(LoadingStatus.IDDLE)
  }

  const fetchCodes = async () => {
    setLoadingStatus(LoadingStatus.FETCHING)
    controllerRef.current = cancelPendingRequest(controllerRef.current)
    const codeSystem = searchParameters.references.map((ref) => ref.url).join(',')
    const response = await fetchValueSet(
      codeSystem,
      {
        search: searchParameters.search,
        exactSearch: false,
        offset: searchParameters.page * searchParameters.offset,
        count: searchParameters.page,
        orderBy: searchParameters.orderBy
      },
      controllerRef.current?.signal
    )
    setLoadingStatus(LoadingStatus.SUCCESS)
    setCodes(response)
  }

  useEffect(() => {
    console.log("test render", loadingStatus)
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchCodes()
    }
  }, [loadingStatus])

  return { searchParameters, codes, loadingStatus, addPage, addSearch, addReferences }
}
