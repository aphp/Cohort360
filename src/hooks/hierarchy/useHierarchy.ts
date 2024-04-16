import {
  buildHierarchy,
  getHierarchyDisplay,
  getItemSelectedStatus,
  getMissingCodes,
  updateHierarchyStatus
} from './../../utils/hierarchy'
import { useEffect, useState } from 'react'
import { LoadingStatus, SelectedStatus } from 'types'
import { getSelectedCodes } from 'utils/hierarchy'
import { Hierarchy } from '../../types/hierarchy'
import { removeElement } from 'utils/arrays'

export const useHierarchy = <T>(
  baseTree: Hierarchy<T, string>[],
  selectedNodes: Hierarchy<T, string>[],
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>
) => {
  const [hierarchyRepresentation, setHierarchyRepresentation] = useState<Hierarchy<T, string>[]>([])
  const [hierarchyDisplay, setHierarchyDisplay] = useState<Hierarchy<T, string>[]>([])
  const [selectedCodes, setSelectedCodes] = useState<Hierarchy<T, string>[]>(selectedNodes)
  const [codes, setCodes] = useState<Map<string, Hierarchy<T, string>>>(new Map())
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [selectAllStatus, setSelectAllStatus] = useState(SelectedStatus.NOT_SELECTED)

  useEffect(() => {
    if (hierarchyDisplay.length) {
      const node = { id: 'parent', subItems: hierarchyDisplay } as Hierarchy<T, string>
      const status = getItemSelectedStatus(node)
      setSelectAllStatus(status)
    }
  }, [hierarchyDisplay])

  useEffect(() => {
    const init = async () => {
      const newCodes = await getMissingCodes(baseTree, codes, [...baseTree, ...selectedCodes], fetchHandler)
      let newTree = buildHierarchy([], [...baseTree, ...selectedCodes], newCodes)
      if (selectedCodes.length) newTree = updateHierarchyStatus(newTree, selectedCodes, SelectedStatus.SELECTED)
      const newDisplay = getHierarchyDisplay(baseTree, newTree)
      setHierarchyRepresentation(newTree)
      setHierarchyDisplay(newDisplay)
      setCodes(newCodes)
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
    init()
  }, [])

  const search = async (
    searchValue: string,
    page: number,
    fetchSearch: (search: string, page: number) => Promise<Hierarchy<T, string>[]>
  ) => {
    setLoadingStatus(LoadingStatus.FETCHING)
    const endCodes = searchValue ? await fetchSearch(searchValue, page) : []
    const newCodes = searchValue ? await getMissingCodes(baseTree, codes, endCodes, fetchHandler) : codes
    const toDisplay = searchValue ? endCodes : baseTree
    // console.log('test codes', newCodes)
    // console.log('test get Paul Brousse', newCodes.get('8312007309'))
    let newTree = buildHierarchy([...hierarchyRepresentation], endCodes, newCodes)
    newTree = updateHierarchyStatus(newTree, endCodes)
    const newDisplay = getHierarchyDisplay(toDisplay, newTree)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setCodes(newCodes)
    setLoadingStatus(LoadingStatus.SUCCESS)
  }

  const select = (node: Hierarchy<T, string>, toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
    const newTree = updateHierarchyStatus(hierarchyRepresentation, [node], status)
    const newDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    const newSelectedCodes = getSelectedCodes(newTree)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setSelectedCodes(newSelectedCodes)
  }

  const selectAll = (toAdd: boolean) => {
    const status = toAdd ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
    const newTree = updateHierarchyStatus(hierarchyRepresentation, hierarchyDisplay, status, true)
    const newDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    const selectedCodes = getSelectedCodes(newTree)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setSelectedCodes(selectedCodes)
  }

  const deleteCode = (node: Hierarchy<T, string>) => {
    const newCodes = removeElement(node, selectedCodes)
    const newTree = updateHierarchyStatus(hierarchyRepresentation, [node], SelectedStatus.NOT_SELECTED)
    const newDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
    setSelectedCodes(newCodes)
  }

  const expand = async (node: Hierarchy<T, string>) => {
    console.log("test expand")
    const status = node.status ? node.status : SelectedStatus.NOT_SELECTED
    const newCodes = await getMissingCodes(baseTree, codes, [node], fetchHandler)
    let newTree = buildHierarchy(hierarchyRepresentation, [node], newCodes)
    newTree = updateHierarchyStatus(newTree, [node], status)
    const newDisplay = getHierarchyDisplay(hierarchyDisplay, newTree)
    setCodes(newCodes)
    setHierarchyRepresentation(newTree)
    setHierarchyDisplay(newDisplay)
  }

  return {
    hierarchy: hierarchyDisplay,
    selectedCodes,
    loadingStatus,
    selectAllStatus,
    search,
    select,
    selectAll,
    expand,
    deleteCode
  }
}
