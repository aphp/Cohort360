import { useReducer, Reducer } from 'react'
import searchCriteriasReducer from 'reducers/searchCriteriasReducer'
import {
  SearchCriterias,
  ActionFilters,
  Direction,
  Order,
  SearchByTypes,
  PatientsFilters,
  PMSIFilters,
  MedicationFilters,
  BiologyFilters,
  PatientDocumentsFilters,
  AllDocumentsFilters
} from 'types/searchCriterias'

export const initPatientsSearchCriterias: SearchCriterias<PatientsFilters> = {
  orderBy: {
    orderBy: Order.FAMILY,
    orderDirection: Direction.ASC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    genders: [],
    birthdatesRanges: [null, null],
    vitalStatuses: []
  }
}

export const initPmsiSearchCriterias: SearchCriterias<PMSIFilters> = {
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    code: '',
    nda: '',
    diagnosticTypes: [],
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

export const initMedSearchCriterias: SearchCriterias<MedicationFilters> = {
  orderBy: {
    orderBy: Order.PERIOD_START,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    nda: '',
    startDate: null,
    endDate: null,
    executiveUnits: [],
    administrationRoutes: [],
    prescriptionTypes: []
  }
}

export const initBioSearchCriterias: SearchCriterias<BiologyFilters> = {
  orderBy: {
    orderBy: Order.EFFECTIVE_DATETIME,
    orderDirection: Direction.ASC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    validatedStatus: true,
    nda: '',
    loinc: '',
    anabio: '',
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

export const initPatientDocsSearchCriterias: SearchCriterias<PatientDocumentsFilters> = {
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    nda: '',
    docTypes: [],
    onlyPdfAvailable: true,
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

export const initAllDocsSearchCriterias: SearchCriterias<AllDocumentsFilters> = {
  orderBy: {
    orderBy: Order.DATE,
    orderDirection: Direction.DESC
  },
  searchInput: '',
  searchBy: SearchByTypes.TEXT,
  filters: {
    ipp: '',
    nda: '',
    docTypes: [],
    onlyPdfAvailable: true,
    startDate: null,
    endDate: null,
    executiveUnits: []
  }
}

const useSearchCriterias = <F>(initState: SearchCriterias<F>) => {
  return useReducer<Reducer<SearchCriterias<F>, ActionFilters<F>>>(
    searchCriteriasReducer<F>(() => initState),
    initState
  )
}

export default useSearchCriterias