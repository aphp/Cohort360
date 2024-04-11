import { fetchValueSet } from 'services/aphp/callApi'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Reference, SearchParameters } from 'types/searchCodes'
import { cancelPendingRequest } from 'utils/abortController'
import { Back_API_Response, HierarchyElementWithSystem, LoadingStatus, SelectedStatus } from 'types'
import { addOrRemoveElement } from 'utils/arrays'
import { addSubItems, getSelectedCodes, updateSelectedStatus } from 'utils/hierarchy'

const DEFAULT_LIMIT = 20

const initSearchParameters = (references: Reference[]): SearchParameters => {
  return {
    limit: DEFAULT_LIMIT,
    offset: 0,
    search: '',
    exactSearch: false,
    references: references.map((ref) => ({ ...ref, checked: ref.standard })),
    loadingStatus: LoadingStatus.IDDLE
  }
}

const initHierarchyParameters = (references: Reference[]): SearchParameters => {
  return {
    search: '*',
    exactSearch: true,
    valueSetTitle: 'Toute la hiérarchie',
    references: references.map((ref, index) => ({ ...ref, checked: index === 0 })),
    loadingStatus: LoadingStatus.IDDLE
  }
}

type FetchParams = {
  noLimit?: boolean
  onlyRoot?: boolean
  parentCode?: string
}

const useSearchCodesAction = (searchParams: SearchParameters) => {
  const [searchParameters, setSearchParameters] = useState(searchParams)
  const [codes, setCodes] = useState<Back_API_Response<HierarchyElementWithSystem>>({})
  const [selectedCodes, setSelectedCodes] = useState<HierarchyElementWithSystem[]>([])
  //const [selectAll, setSelectAll] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  const selectResearchCodes = (ids: string[]) => {
    let newSelectedCodes = [...selectedCodes]
    ids.forEach((id) => {
      const codeToAdd = (codes.results || []).find((code) => code.id === id)
      if (codeToAdd) newSelectedCodes = addOrRemoveElement(codeToAdd, newSelectedCodes)
    })
    setSelectedCodes(newSelectedCodes)
  }

  const selectHierarchyCodes = (path: number[], toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.NOT_SELECTED : SelectedStatus.SELECTED
    const updatedHierarchy = updateSelectedStatus(path, codes.results || [], status)
    const updatedSelectedCodes = getSelectedCodes(updatedHierarchy[0], [])
    setSelectedCodes(updatedSelectedCodes)
    setCodes({ ...codes, results: updatedHierarchy })
  }

  const expandHierarchy = async (parentCode: string, indexs: number[]) => {
    const child = (await fetchCodes({ parentCode })).results || []
    const sortedChild = child.sort((a, b) => a.label.localeCompare(b.label))
    const newTree = addSubItems(codes.results || [], 0, indexs, sortedChild)
    setCodes({ count: codes.count, results: newTree })
  }

  const addReferencesParameter = (references: Reference[]) => {
    setSearchParameters({ ...searchParameters, references })
  }

  const addSearchInputParameter = (search: string) => {
    setSearchParameters({ ...searchParameters, search })
  }

  /*const handleFetchAll = () => {
    fetchCodes({ noLimit: true })
    setSelectAll(true)
  }*/

  const handleFetchNext = () => {
    console.log('test infinte', searchParameters.offset, searchParameters.limit)
    if (searchParameters.offset !== undefined && searchParameters.limit !== undefined)
      setSearchParameters({ ...searchParameters, offset: searchParameters.offset + searchParameters.limit })
  }

  const fetchCodes = async (fetchParams?: FetchParams) => {
    const codeSystem = searchParameters.references
      .filter((ref) => ref.checked)
      .map((ref) => ref.url)
      .join(',')
    const limit = fetchParams?.noLimit ? 0 : searchParameters.limit || 0
    const parentCode = fetchParams?.parentCode || ''
    try {
      const response = await fetchValueSet(
        codeSystem,
        {
          code: parentCode,
          search: searchParameters.search,
          exactSearch: searchParameters.exactSearch,
          valueSetTitle: searchParameters.valueSetTitle,
          offset: searchParameters.offset,
          count: limit,
          orderBy: searchParameters.orderBy,
          filterRoots: searchParameters.valueSetTitle
            ? (atcData) =>
                atcData.label.search(new RegExp(/^[A-Z] - /, 'gi')) !== -1 &&
                atcData.label.search(new RegExp(/^[X-Y] - /, 'gi')) !== 0
            : undefined
        },
        controllerRef.current?.signal
      )
      return response
    } catch {
      return { results: [], count: 0 }
    }
  }

  const handleFetchCode = async (fetchParams?: FetchParams) => {
    setSearchParameters({ ...searchParameters, loadingStatus: LoadingStatus.FETCHING })
    const response = await fetchCodes()
    if (searchParameters.offset && searchParameters.offset > 0 && !fetchParams?.noLimit) {
      setCodes({
        ...response,
        results: [...(codes?.results || []), ...(response.results || [])]
      })
    } else {
      setCodes(response)
    }
    setSearchParameters({ ...searchParameters, loadingStatus: LoadingStatus.SUCCESS })
  }

  useEffect(() => {
    if (!searchParameters.offset) setSearchParameters({ ...searchParameters, loadingStatus: LoadingStatus.IDDLE })
    else setSearchParameters({ ...searchParameters, offset: 0 })
  }, [searchParameters.search, searchParameters.references, searchParameters.orderBy])

  useEffect(() => {
    setSearchParameters({ ...searchParameters, loadingStatus: LoadingStatus.IDDLE })
  }, [searchParameters.offset])

  useEffect(() => {
    if (searchParameters.loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      handleFetchCode()
    }
  }, [searchParameters.loadingStatus])

  return {
    searchParameters,
    codes,
    selectedCodes,
    /*  handleFetchAll,*/
    handleFetchNext,
    addReferencesParameter,
    addSearchInputParameter,
    selectResearchCodes,
    selectHierarchyCodes,
    expandHierarchy
  }
}

export const useCodes = (references: Reference[]) => {
  const search = useSearchCodesAction(initSearchParameters(references))
  const hierarchy = useSearchCodesAction(initHierarchyParameters(references))

  const [selectedCodes, setSelectedCodes] = useState<HierarchyElementWithSystem[]>([])

  useEffect(() => {
    const uniqueArray = [...search.selectedCodes, ...hierarchy.selectedCodes].filter((current, index, array) => {
      const firstIndex = array.findIndex((element) => element.id === current.id && element.label === current.label)
      return index === firstIndex
    })
    setSelectedCodes(uniqueArray)
  }, [search.selectedCodes, hierarchy.selectedCodes])

  const selectedIds = useMemo<Map<string, true>>(() => {
    return selectedCodes.reduce((map, code) => {
      map.set(code.id, true)
      return map
    }, new Map())
  }, [selectedCodes])

  return {
    search,
    hierarchy,
    selectedCodes,
    selectedIds
  }
}
