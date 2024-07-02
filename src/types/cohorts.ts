import { Extension } from 'fhir/r4'
import { ExploredCohortState } from 'state/exploredCohort'
import { CohortData } from 'types'

export enum CohortsType {
  ALL = 'AllCohorts',
  FAVORITE = 'FavoriteCohorts',
  LAST = 'LastCohorts',
  NOT_FAVORITE = 'NotFavoriteCohorts'
}

export enum CohortsTypeLabel {
  ALL = 'Toutes les cohortes',
  FAVORITE = 'Cohortes favorites',
  LAST = 'Dernières cohortes',
  NOT_FAVORITE = 'Cohortes non favorites'
}