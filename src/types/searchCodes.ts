import { RessourceType } from "./requestCriterias";
import { OrderBy } from "./searchCriterias";

export enum References {
    ATC,
    UCD,
    UCD_13,
    LOINC,
    ANABIO,
    GHM,
    CIM10,
    CCAM
}

export enum ReferencesLabel {
  ATC = 'ATC',
  UCD = 'UCD',
  UCD_13 = 'UCD 13',
  LOINC = 'Loinc',
  ANABIO = 'Anabio',
  GHM = 'Ghm',
  CIM10 = 'Cim10',
  CCAM = 'Ccam'
}

export type Reference = {
    id: References
    label: ReferencesLabel
    standard: boolean
    url: string
    checked: boolean
}

export type SearchParameters = {
  type: RessourceType.MEDICATION | RessourceType.OBSERVATION | RessourceType.PMSI
  references: Reference[]
  search: string
  page: number
  limit: number
  orderBy: OrderBy
}