export const getInclusionCriteriaUrl = (inclusionCriteria: any, index: any) => {
  switch (inclusionCriteria.type) {
    case 'Document médical':
      return `/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/medicalDoc/${index}`
    case 'Démographie patient':
      return `/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/patientDemography/${index}`
    case 'Diagnostic CIM':
      return `/cohort/new/inclusionDiagram/addAction/addInclusionCriteria/cimDiagnostic/${index}`
    default:
      return ''
  }
}

export const mapParamsToNetworkParams = (params: string[]) => {
  let url = ''
  params.forEach((item, index) => {
    url += index === 0 ? `?${item}` : `&${item}`
  })
  return url
}
