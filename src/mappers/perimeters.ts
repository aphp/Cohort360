import { SourceType, SourceValue, ExecutiveScopeLevels } from 'types/scope'

export const scopeLevelsToRequestParam = (sourceType: SourceType) => {
  const levels: SourceValue[] = []
  const allLevels: ExecutiveScopeLevels = [
    SourceValue.APHP,
    SourceValue.GH,
    SourceValue.GHU,
    SourceValue.HOPITAL,
    SourceValue.POLE,
    SourceValue.UF
  ]
  for (const element of allLevels) {
    levels.push(element)
    if (element.toString() === sourceType) break
  }
  return levels.join(',')
}
