import { fetchValueSet } from 'services/aphp/callApi'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Reference, SearchParameters } from 'types/searchCodes'
import { cancelPendingRequest } from 'utils/abortController'
import { Back_API_Response, HierarchyElementWithSystem, LoadingStatus, SelectedStatus } from 'types'
import { addElement, addOrRemoveElement, isFound, removeElement } from 'utils/arrays'
import { update } from 'lodash'

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

  const selectHierarchyCodes = (path: number[]) => {
    const getItemStatus = (item: HierarchyElementWithSystem): SelectedStatus => {
      if (item.subItems?.length === 0) return item.status ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
      if (item.subItems?.every((item) => item.status === SelectedStatus.SELECTED)) return SelectedStatus.NOT_SELECTED
      if (item.subItems?.every((item) => item.status === SelectedStatus.NOT_SELECTED))
        return SelectedStatus.NOT_SELECTED
      return SelectedStatus.INDETERMINATE
    }
    const getSelected = (path: number[], list: HierarchyElementWithSystem[]): HierarchyElementWithSystem => {
      const currentIndex = path[0]
      if (path.length > 1) {
        path.shift()
        return getSelected(path, list[currentIndex].subItems || [])
      }
      return list[currentIndex]
    }
    const updateHierarchyStatus = (path: number[], list: HierarchyElementWithSystem[], status: SelectedStatus) => {
      const currentIndex = path[0]
      if (path.length > 1) {
        const newPath = [...path]
        newPath.shift()
        updateHierarchyStatus(newPath, list[currentIndex].subItems || [], status)
      }
      if (path.length === 1) {
        list[currentIndex].status = status
        // console.log('test status enfant', status)
      }
      if (path.length === 2) {
        list[currentIndex].status = getItemStatus(list[currentIndex])
        /*console.log(
          'test status parent',
          getItemStatus(list[currentIndex]),
          list[currentIndex].label,
          list[currentIndex].subItems
        )*/
      }
      return [...list]
    }
    const updateSelectedCodes = (
      path: number[],
      list: HierarchyElementWithSystem[],
      selectedCodes: HierarchyElementWithSystem[],
      status: SelectedStatus
    ) => {
      const currentIndex = path[0]
      //let newSelectedCodes: HierarchyElementWithSystem[] = []
      if (path.length > 1) {
        const newPath = [...path]
        newPath.shift()
        updateSelectedCodes(newPath, list[currentIndex].subItems || [], selectedCodes, status)
      }
      /*if (path.length === 1) {
        newSelectedCodes = addOrRemoveElement(list[currentIndex], selectedCodes)
      }*/
      if (path.length === 1) {
        if (status === SelectedStatus.SELECTED) {
          selectedCodes = addElement(list[currentIndex], selectedCodes)
          list[currentIndex].subItems?.forEach((subItem) => {
            selectedCodes = removeElement(subItem, selectedCodes)
          })
        } else {
          selectedCodes = removeElement(list[currentIndex], selectedCodes)
        }
      }
      return selectedCodes
    }
    const codeToAdd = getSelected([...path], codes.results || [])
    const status = isFound(codeToAdd, selectedCodes) ? SelectedStatus.NOT_SELECTED : SelectedStatus.SELECTED
    // newSelectedCodes = addOrRemoveElement(codeToAdd, newSelectedCodes)
    const updatedHierarchy = updateHierarchyStatus(path, codes.results || [], status)
    const updatedSelectedCodes = updateSelectedCodes(path, updatedHierarchy, selectedCodes, status)
    console.log('test selection', updatedSelectedCodes)
    setSelectedCodes([...updatedSelectedCodes])
    setCodes({ ...codes, results: updatedHierarchy })
  }

  const expandHierarchy = async (parentCode: string, indexs: number[]) => {
    const child = (await fetchCodes({ parentCode })).results || []
    const sortedChild = child.sort((a, b) => a.label.localeCompare(b.label))
    const addSubItem = (
      tree: HierarchyElementWithSystem[],
      depth: number,
      indices: number[],
      toAdd: HierarchyElementWithSystem[]
    ) => {
      const index = indices[depth]
      if (depth < indices.length - 1) {
        addSubItem(tree[index].subItems || [], depth + 1, indices, toAdd)
      } else {
        tree[index].subItems = toAdd
      }
      return tree
    }
    const newTree = addSubItem(codes.results || [], 0, indexs, sortedChild)
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
    console.log('test selected', hierarchy.selectedCodes)
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
