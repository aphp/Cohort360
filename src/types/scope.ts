export type FetchScopeOptions = {
  ids?: string
  cohortIds?: string
  practitionerId?: string
  search?: string
  page?: number
  limit?: number
  sourceType?: SourceType
}

export enum SourceValue {
  APHP = 'AP-HP',
  GH = 'Groupe hospitalier (GH)',
  GHU = 'GHU',
  HOPITAL = 'Hôpital',
  POLE = 'Pôle/DMU',
  UF = 'Unité Fonctionnelle (UF)'
}

export enum SourceType {
  BIOLOGY = SourceValue.HOPITAL,
  CCAM = SourceValue.UF,
  CIM10 = SourceValue.UF,
  GHM = SourceValue.HOPITAL,
  MEDICATION = SourceValue.HOPITAL,
  DOCUMENT = SourceValue.HOPITAL,
  SUPPORTED = SourceValue.UF,
  IMAGING = SourceValue.HOPITAL,
  FORM_RESPONSE = SourceValue.UF,
  MATERNITY = SourceValue.HOPITAL,
  APHP = SourceValue.APHP,
  ALL = SourceValue.UF
}

export type ExecutiveScopeLevels = [
  SourceValue.APHP,
  SourceValue.GH,
  SourceValue.GHU,
  SourceValue.HOPITAL,
  SourceValue.POLE,
  SourceValue.UF
]

export enum Rights {
  EXPIRED = 'expired'
}
