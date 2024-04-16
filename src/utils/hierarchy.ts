import { SelectedStatus } from 'types'
import { Hierarchy, InfiniteMap, NodeValidity } from 'types/hierarchy'
import { arrayToMap } from './arrays'

const mapInfiniteMapToList = (map: InfiniteMap): string[] => {
  let allValues: string[] = []
  map.forEach((value, key) => {
    allValues.push(key)
    if (value instanceof Map) {
      allValues = allValues.concat(mapInfiniteMapToList(value))
    }
  })
  return allValues
}
export const mapHierarchyToMap = <T>(hierarchy: Hierarchy<T, string>[]) => {
  return hierarchy.reduce((resultMap: Map<string, Hierarchy<T, string>>, item) => {
    resultMap.set(item.id, item)
    return resultMap
  }, new Map())
}

const getMissingIds = <T>(prevCodes: Map<string, Hierarchy<T, string>>, codes: Map<string, null>) => {
  const missingCodes: string[] = []
  for (const [key] of codes) {
    if (!prevCodes.get(key)) missingCodes.push(key)
  }
  return missingCodes
}

const addAllFetchedIds = <T>(
  codes: Map<string, Hierarchy<T, string>>,
  results: Hierarchy<T, string>[],
  fetchedIds: string[]
) => {
  const missingIdsInResponse = fetchedIds
    .filter((id) => !results.find((item) => item.id === id))
    .map((id) => ({ id, validity: NodeValidity.NOT_VALID })) as Hierarchy<T, string>[]
  const missingIdsInResponseMap = mapHierarchyToMap(missingIdsInResponse)
  const resultsMap = mapHierarchyToMap(validNodes(results, NodeValidity.VALID))
  return new Map([...codes, ...resultsMap, ...missingIdsInResponseMap])
}

const validNodes = <T>(nodes: Hierarchy<T, string>[], status: NodeValidity) => {
  return nodes.map((node) => ({ ...node, validity: status }))
}

// CODES QUI NE SONT PAS RECHERCHES
// car ils sont dans le cache AllCodes mais en fait leurs enfants n'avaient pas été cherchés
export const getMissingCodes = async <T>(
  baseTree: Hierarchy<T, string>[],
  prevCodes: Map<string, Hierarchy<T, string>>,
  newCodes: Hierarchy<T, string>[],
  fetchHandler: (ids: string) => Promise<Hierarchy<T, string>[]>
) => {
  const newCodesMap = mapHierarchyToMap(validNodes(newCodes, NodeValidity.VALID))
  const parentsCodes = getAboveLevels(newCodes, baseTree)
  const childrenCodes = getInferiorLevels(newCodes)
  let allCodes = new Map([...prevCodes, ...newCodesMap])
  let missingIds = getMissingIds(allCodes, arrayToMap([...parentsCodes, ...childrenCodes], null))
  // console.log('test missingIds', missingIds)
  if (missingIds.length) {
    // if (missingIds.includes('18042109753')) console.log("test parisSaclay")
    const ids = missingIds.join(',')
    const parentsResponse = await fetchHandler(ids)
    allCodes = addAllFetchedIds(allCodes, parentsResponse, missingIds)
    const childrenCodes = getInferiorLevels(parentsResponse.filter((item) => parentsCodes.includes(item.id)))
    missingIds = getMissingIds(allCodes, arrayToMap([...childrenCodes], null))
    if (missingIds.length) {
      const ids = missingIds.join(',')
      const childrenResponse = await fetchHandler(ids)
      allCodes = addAllFetchedIds(allCodes, childrenResponse, missingIds)
    }
  }
  return allCodes
}

const getMissingNode = <T>(code: Hierarchy<T, string> | null, node: Hierarchy<T, string>) => {
  if (!node) {
    if (!code || code.validity === NodeValidity.NOT_VALID)
      node = { id: 'Unknown', validity: NodeValidity.NOT_VALID } as Hierarchy<T, string>
    else {
      node = code
      node.validity = NodeValidity.VALID
    }
  }
  return node
}

const getMissingSubItems = <T>(node: Hierarchy<T, string>, codes: Map<string, Hierarchy<T, string>>) => {
  const subItems = [...(node.subItems || [])]
  const levels = node.inferior_levels_ids?.split(',')
  const idsToGet = levels?.filter((level) => !subItems.find((subItem) => subItem.id === level)).filter((item) => item)
  if (!idsToGet.length) return subItems
  idsToGet.forEach((id) => {
    const foundCode = codes.get(id)
    if (foundCode) subItems.push(foundCode)
  })
  return subItems.length ? subItems : undefined
}

export const buildHierarchy = <T>(
  baseTree: Hierarchy<T, string>[],
  endCodes: Hierarchy<T, string>[],
  allCodes: Map<string, Hierarchy<T, string>>
) => {
  const buildBranch = <T>(
    node: Hierarchy<T, string>,
    path: [string, InfiniteMap],
    codes: Map<string, Hierarchy<T, string>>,
    status: SelectedStatus
  ) => {
    const [key, nextPath] = path
    const code = codes.get(key) || null
    node = getMissingNode(code, node)
    node.subItems = getMissingSubItems(node, codes)
    if (nextPath.size) {
      for (const [nextKey, nextValue] of nextPath) {
        if (node.subItems) {
          const index = node.subItems.findIndex((elem) => elem.id === nextKey)
          if (index > -1) {
            const item = buildBranch(node.subItems[index], [nextKey, nextValue], codes, status)
            node.subItems[index] = item
          }
        }
      }
    }
    return node
  }

  const paths = getPaths(baseTree, endCodes, false)
  const uniquePaths = getUniquePath(paths)
  //console.log('test paths', uniquePaths)
  for (let [key, value] of uniquePaths) {
    const index = baseTree.findIndex((elem) => elem.id === key)
    const branch = buildBranch(baseTree[index] || null, [key, value], allCodes, SelectedStatus.NOT_SELECTED)
    if (branch) index > -1 ? (baseTree[index] = branch) : baseTree.push(branch)
  }
  return [...baseTree]
}

export const getHierarchyDisplay = <T>(defaultLevels: Hierarchy<T, string>[], tree: Hierarchy<T, string>[]) => {
  let branches: Hierarchy<T, string>[] = []
  if (defaultLevels.length && tree.length)
    branches = defaultLevels.map((item) => {
      const path = item.above_levels_ids ? [...getAboveLevelsWithRights(item, tree), ...[item.id]] : [item.id]
      return findBranch(path, tree) || { id: 'notFound' }
    })
  return branches
}

export const updateHierarchyStatus = <T>(
  tree: Hierarchy<T, string>[],
  endCodes: Hierarchy<T, string>[],
  status?: SelectedStatus,
  selectAll = false
) => {
  const updateBranchStatus = <T>(node: Hierarchy<T, string>, path: [string, InfiniteMap], status?: SelectedStatus) => {
    const [, nextPath] = path
    if (nextPath.size) {
      for (const [nextKey, nextValue] of nextPath) {
        if (node.subItems) {
          const index = node.subItems.findIndex((elem) => elem.id === nextKey)
          if (index > -1) {
            const item = updateBranchStatus(node.subItems[index], [nextKey, nextValue], status)
            node.subItems[index] = item
          }
        }
      }
      node.status = getItemSelectedStatus(node)
     //   console.log('test last 2', node.status, node.name)
    } else {
      //console.log('test last', status, node.name)
      node.status = status !== undefined ? status : node.status
      updateInferiorLevelsStatus(node, node.status)
    }
    return node
  }

  const paths = getPaths(tree, endCodes, selectAll)
  const uniquePaths = getUniquePath(paths)
  //console.log('test path', uniquePaths)
  for (let [key, value] of uniquePaths) {
    const index = tree.findIndex((elem) => elem.id === key)
    const branch = updateBranchStatus(tree[index] || null, [key, value], status)
    if (branch) index > -1 ? (tree[index] = branch) : tree.push(branch)
  }
  return [...tree]
}

const findBranch = <T>(path: string[], tree: Hierarchy<T, string>[]): Hierarchy<T, string> => {
  let branch: Hierarchy<T, string> = { id: 'empty' } as Hierarchy<T, string>
  const key = path[0]
  const index = tree.findIndex((item) => item.id === key)
  const next = tree[index]
  if (path.length === 1) {
    branch = next
  } else if (next && next.subItems) {
    if (next.status !== SelectedStatus.INDETERMINATE)
      next.subItems = next.subItems.map((item) => ({ ...item, status: next.status }))
    branch = findBranch(path.slice(1), next.subItems)
  }
  return branch
}

const getPaths = <T>(baseTree: Hierarchy<T, string>[], endCodes: Hierarchy<T, string>[], selectAll: boolean) => {
  let paths = endCodes.map((item) =>
    item.above_levels_ids ? [...getAboveLevelsWithRights(item, baseTree), ...[item.id]] : [item.id]
  )
  if (selectAll) {
    for (const path of paths) {
      const lastId = path[path.length - 1]
      paths = paths.filter((path) => {
        const index = path.findIndex((id) => id === lastId)
        if (index < 0 || index === path.length - 1) return true
        return false
      })
    }
  }
  return paths
}

const getUniquePath = (paths: string[][]): InfiniteMap => {
  const tree = new Map()
  for (const path of paths) {
    let currentNode = tree
    for (const id of path) {
      if (!currentNode.has(id)) {
        currentNode.set(id, new Map())
      }
      currentNode = currentNode.get(id)
    }
  }
  return tree
}

/*const updateBranchStatus = <T>(subItems: Hierarchy<T, string>[] | undefined, status: SelectedStatus) => {
  if (subItems) for (const subItem of subItems) subItem.status = subItem.status || status
  return subItems
}*/

const updateInferiorLevelsStatus = <T>(node: Hierarchy<T, string>, status: SelectedStatus | undefined) => {
  if (node.subItems) {
    for (const subItem of node.subItems) {
      subItem.status = status === SelectedStatus.SELECTED ? SelectedStatus.SELECTED : SelectedStatus.NOT_SELECTED
      updateInferiorLevelsStatus(subItem, status)
    }
  }
  return node
}

export const getItemSelectedStatus = <T, S>(item: Hierarchy<T, S>): SelectedStatus => {
  if (item.subItems?.every((item) => item.status === SelectedStatus.SELECTED)) return SelectedStatus.SELECTED
  if (item.subItems?.every((item) => item.status === SelectedStatus.NOT_SELECTED || item.status === undefined))
    return SelectedStatus.NOT_SELECTED
  return SelectedStatus.INDETERMINATE
}

export const getSelectedCodes = <T>(list: Hierarchy<T, string>[]) => {
  const get = <T>(hierarchy: Hierarchy<T, string>, selectedCodes: Hierarchy<T, string>[]) => {
    if (hierarchy.status === SelectedStatus.INDETERMINATE)
      hierarchy.subItems?.forEach((subItem) => get(subItem, selectedCodes))
    if (hierarchy.status === SelectedStatus.SELECTED) selectedCodes.push(hierarchy)
    return selectedCodes
  }
  const selectedCodes = list.flatMap((hierarchy) => get(hierarchy, []))
  return selectedCodes
}

const getAboveLevelsWithRights = <T>(item: Hierarchy<T, string>, baseTree: Hierarchy<T, string>[]) => {
  const levels = (item.above_levels_ids || '').split(',')
  const ids = baseTree.map((code) => code.id)
  const startIndex = levels.findIndex((level) => ids.includes(level))
  if (startIndex > -1) return levels.slice(startIndex)
  return []
}

const getAboveLevels = <T>(hierarchy: Hierarchy<T, string>[], baseTree: Hierarchy<T, string>[]) => {
  return hierarchy.flatMap((item) =>
    [...getAboveLevelsWithRights(item, baseTree)].filter((item) => item && item !== 'null' && item !== 'undefined')
  )
}

const getInferiorLevels = <T>(hierarchy: Hierarchy<T, string>[]) => {
  return hierarchy
    .flatMap((item) => (item.inferior_levels_ids || '').split(','))
    .filter((item) => item && item !== 'null' && item !== 'undefined')
}
