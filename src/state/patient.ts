import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { RootState } from 'state'

import {
  IPatient,
  IClaim,
  IComposition,
  IProcedure,
  IEncounter,
  ICondition,
  IIdentifier,
  IMedicationAdministration,
  IMedicationRequest
} from '@ahryman40k/ts-fhir-types/lib/R4'
import { CohortEncounter, IPatientDetails, IPatientDocuments, IPatientPmsi, IPatientMedication } from 'types'

import { logout } from './me'

import services from 'services'

export type PatientState = null | {
  loading: boolean
  deidentified?: boolean
  patientInfo?: IPatientDetails
  hospits?: {
    loading: boolean
    list: (CohortEncounter | IEncounter)[]
  }
  documents?: IPatientDocuments
  pmsi?: {
    diagnostic?: IPatientPmsi<ICondition>
    ghm?: IPatientPmsi<IClaim>
    ccam?: IPatientPmsi<IProcedure>
  }
  medication?: {
    administration?: IPatientMedication<IMedicationAdministration>
    prescription?: IPatientMedication<IMedicationRequest>
  }
}

const localStoragePatient = localStorage.getItem('patient') || null
const initialState: PatientState = localStoragePatient ? JSON.parse(localStoragePatient) : null

/**
 * fetchPmsi
 *
 */
type FetchPmsiParams = {
  selectedTab: 'diagnostic' | 'ghm' | 'ccam'
  groupId?: string
  options?: {
    page?: number
    filters?: {
      searchInput: string
      nda: string
      code: string
      diagnosticTypes: string[]
      startDate: string | null
      endDate: string | null
    }
    sort?: {
      by: string
      direction: string
    }
  }
}
type FetchPmsiReturn =
  | { diagnostic: IPatientPmsi<ICondition> }
  | { ghm: IPatientPmsi<IClaim> }
  | { ccam: IPatientPmsi<IProcedure> }
  | undefined
const fetchPmsi = createAsyncThunk<FetchPmsiReturn, FetchPmsiParams, { state: RootState }>(
  'patient/fetchPmsi',
  async ({ selectedTab, groupId, options }, { getState }) => {
    const patientState = getState().patient
    const currentPmsiState = patientState?.pmsi ? patientState?.pmsi[selectedTab] ?? { total: null } : { total: null }

    const patientId = patientState?.patientInfo?.id ?? ''
    if (!patientId) {
      throw new Error('Patient Error: patient is required')
    }
    const deidentified = patientState?.deidentified ?? true
    const hospits = patientState?.hospits?.list ?? []

    const sortBy = options?.sort?.by ?? ''
    const sortDirection = options?.sort?.direction ?? ''
    const page = options?.page ?? 1
    const searchInput = options?.filters?.searchInput ?? ''
    const code = options?.filters?.code ?? ''
    const diagnosticTypes = options?.filters?.diagnosticTypes ?? []
    const nda = options?.filters?.nda ?? ''
    const startDate = options?.filters?.startDate ?? null
    const endDate = options?.filters?.endDate ?? null

    const pmsiResponse = await services.patients.fetchPMSI(
      page,
      patientId,
      selectedTab,
      searchInput,
      nda,
      code,
      diagnosticTypes,
      sortBy,
      sortDirection,
      groupId,
      startDate,
      endDate
    )

    if (pmsiResponse.pmsiData === undefined) return undefined

    const pmsiList: any[] = linkElementWithEncounter(
      pmsiResponse.pmsiData as (IProcedure | ICondition | IClaim)[],
      hospits,
      deidentified
    )

    const pmsiReturn = {
      loading: false,
      count: pmsiResponse.pmsiTotal ?? 0,
      total: currentPmsiState?.total ?? pmsiResponse.pmsiTotal ?? 0,
      list: pmsiList,
      page,
      options
    }

    switch (selectedTab) {
      case 'diagnostic':
        return { diagnostic: pmsiReturn as IPatientPmsi<ICondition> }
      case 'ccam':
        return { ccam: pmsiReturn as IPatientPmsi<IProcedure> }
      case 'ghm':
        return { ghm: pmsiReturn as IPatientPmsi<IClaim> }
    }
  }
)
/**
 * fetchMedication
 *
 */
type FetchMedicationParams = {
  selectedTab: 'prescription' | 'administration'
  groupId?: string
  options?: {
    page?: number
    filters?: {
      searchInput: string
      nda: string
      selectedPrescriptionTypes: { id: string; label: string }[]
      selectedAdministrationRoutes: { id: string; label: string }[]
      startDate: string | null
      endDate: string | null
    }
    sort?: {
      by: string
      direction: string
    }
  }
}
type FetchMedicationReturn =
  | { prescription: IPatientMedication<IMedicationRequest> }
  | { administration: IPatientMedication<IMedicationAdministration> }
  | undefined
const fetchMedication = createAsyncThunk<FetchMedicationReturn, FetchMedicationParams, { state: RootState }>(
  'patient/fetchMedication',
  async ({ selectedTab, groupId, options }, { getState }) => {
    const patientState = getState().patient
    const currentMedicationState = patientState?.medication
      ? patientState?.medication[selectedTab] ?? { total: null }
      : { total: null }

    const patientId = patientState?.patientInfo?.id ?? ''
    if (!patientId) {
      throw new Error('Patient Error: patient is required')
    }
    const deidentified = patientState?.deidentified ?? true
    const hospits = patientState?.hospits?.list ?? []

    const sortBy = options?.sort?.by ?? ''
    const sortDirection = options?.sort?.direction ?? ''
    const page = options?.page ?? 1
    const searchInput = options?.filters?.searchInput ?? ''
    const prescriptionTypes = options?.filters?.selectedPrescriptionTypes?.map(({ id }) => id).join(',') ?? ''
    const administrationRoutes = options?.filters?.selectedAdministrationRoutes?.map(({ id }) => id).join(',') ?? ''
    const nda = options?.filters?.nda ?? ''
    const startDate = options?.filters?.startDate ?? null
    const endDate = options?.filters?.endDate ?? null

    const medicationResponse = await services.patients.fetchMedication(
      page,
      patientId,
      selectedTab,
      sortBy,
      sortDirection,
      searchInput,
      nda,
      prescriptionTypes,
      administrationRoutes,
      groupId,
      startDate ? startDate : undefined,
      endDate ? endDate : undefined
    )

    if (medicationResponse.medicationData === undefined) return undefined

    const medicationList: any[] = linkElementWithEncounter(
      medicationResponse.medicationData as (IMedicationRequest | IMedicationAdministration)[],
      hospits,
      deidentified
    )

    const medicationReturn = {
      loading: false,
      count: medicationResponse.medicationTotal ?? 0,
      total: currentMedicationState?.total ?? medicationResponse.medicationTotal ?? 0,
      list: medicationList,
      page,
      options
    }

    switch (selectedTab) {
      case 'prescription':
        return { prescription: medicationReturn as IPatientMedication<IMedicationRequest> }
      case 'administration':
        return { administration: medicationReturn as IPatientMedication<IMedicationAdministration> }
    }
  }
)

/**
 * fetchDocument
 *
 */
type FetchDocumentsParams = {
  groupId?: string
  options?: {
    page?: number
    filters?: {
      searchInput: string
      nda: string
      selectedDocTypes: string[]
      startDate: string | null
      endDate: string | null
    }
    sort?: {
      by: string
      direction: string
    }
  }
}
type FetchDocumentsReturn = { documents?: IPatientDocuments } | undefined
const fetchDocuments = createAsyncThunk<FetchDocumentsReturn, FetchDocumentsParams, { state: RootState }>(
  'patient/fetchDocuments',
  async ({ groupId, options }, { getState }) => {
    try {
      const patientState = getState().patient

      const patientId = patientState?.patientInfo?.id ?? ''
      if (!patientId) {
        throw new Error('Patient Error: patient is required')
      }
      const deidentified = patientState?.deidentified ?? true
      const hospits = patientState?.hospits?.list ?? []

      const sortBy = options?.sort?.by ?? ''
      const sortDirection = options?.sort?.direction ?? ''
      const page = options?.page ?? 1
      const searchInput = options?.filters?.searchInput ?? ''
      const selectedDocTypes = options?.filters?.selectedDocTypes ?? []
      const nda = options?.filters?.nda ?? ''
      const startDate = options?.filters?.startDate ?? null
      const endDate = options?.filters?.endDate ?? null

      const documentsResponse = await services.patients.fetchDocuments(
        sortBy,
        sortDirection,
        page,
        patientId,
        searchInput,
        selectedDocTypes,
        nda,
        startDate,
        endDate,
        groupId
      )

      const documentsList: any[] = linkElementWithEncounter(
        documentsResponse.docsList as IComposition[],
        hospits,
        deidentified
      )

      return {
        documents: {
          loading: false,
          count: documentsResponse.docsTotal,
          total: patientState?.documents?.total ? patientState?.documents?.total : documentsResponse.docsTotal,
          list: documentsList,
          page,
          options
        } as IPatientDocuments
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * fetchAllProcedure
 *
 */
type FetchAllProceduresParams = {
  patientId: string
  groupId?: string
}
type FetchAllProceduresReturn =
  | {
      ccam?: IPatientPmsi<IProcedure>
      diagnostic?: IPatientPmsi<ICondition>
    }
  | undefined
const fetchAllProcedures = createAsyncThunk<FetchAllProceduresReturn, FetchAllProceduresParams, { state: RootState }>(
  'patient/fetchAllProcedures',
  async ({ patientId, groupId }, { getState }) => {
    try {
      const patientState = getState().patient

      const deidentified = patientState?.deidentified ?? true
      const hospits = patientState?.hospits?.list ?? []
      // CCAM Variables:
      const ccamTotal = patientState?.pmsi?.ccam?.total ?? 0
      let ccamCount = patientState?.pmsi?.ccam?.list.length ?? 0

      // CIM10 Variables:
      const diagnosticTotal = patientState?.pmsi?.diagnostic?.total ?? 0
      let diagnosticCount = patientState?.pmsi?.diagnostic?.list.length ?? 0

      // API Calls:
      const [ccamResponses, diagnosticResponses] = await Promise.all([
        ccamTotal - ccamCount !== 0
          ? services.patients.fetchAllProcedures(patientId, groupId ?? '', ccamTotal - ccamCount)
          : null,
        diagnosticTotal - diagnosticCount !== 0
          ? services.patients.fetchMainDiagnostics(patientId, groupId ?? '', diagnosticTotal - diagnosticCount)
          : null
      ])

      // CCAM List:
      let ccamList: IProcedure[] = ccamResponses
        ? linkElementWithEncounter(ccamResponses as IProcedure[], hospits, deidentified)
        : []
      ccamList = patientState?.pmsi?.ccam?.list ? [...patientState?.pmsi?.ccam?.list, ...ccamList] : ccamList
      ccamCount = ccamList.length

      // CIM10 List:
      let diagnosticList: ICondition[] = diagnosticResponses
        ? linkElementWithEncounter(diagnosticResponses as ICondition[], hospits, deidentified)
        : []
      diagnosticList = patientState?.pmsi?.diagnostic?.list
        ? [...patientState?.pmsi?.diagnostic?.list, ...diagnosticList]
        : diagnosticList
      diagnosticCount = diagnosticList.length

      return {
        ccam: {
          loading: false,
          count: ccamCount,
          total: ccamTotal ?? ccamCount,
          list: ccamList,
          page: 1
        },
        diagnostic: {
          loading: false,
          count: diagnosticCount,
          total: diagnosticTotal ?? diagnosticCount,
          list: diagnosticList,
          page: 1
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * fetchLastPmsi
 *
 */
type FetchLastPmsiParams = {
  patientId: string
  groupId?: string
}
type FetchLastPmsiReturn = {
  patientInfo: {
    lastGhm?: IClaim | 'loading'
    lastProcedure?: IProcedure | 'loading'
    mainDiagnosis?: ICondition[] | 'loading'
  }
  pmsi?: {
    diagnostic?: IPatientPmsi<ICondition>
    ghm?: IPatientPmsi<IClaim>
    ccam?: IPatientPmsi<IProcedure>
  }
} | null

const fetchLastPmsiInfo = createAsyncThunk<FetchLastPmsiReturn, FetchLastPmsiParams, { state: RootState }>(
  'patient/fetchLastPmsiInfo',
  async ({ patientId, groupId }, { getState }) => {
    try {
      const patientState = getState().patient

      const hospits = patientState?.hospits?.list ?? []
      const deidentified = patientState?.deidentified ?? []

      const fetchPatientResponse = await Promise.all([
        services.patients.fetchPMSI(0, patientId, 'diagnostic', '', '', '', [], 'recorded-date', 'desc', groupId),
        services.patients.fetchPMSI(0, patientId, 'ccam', '', '', '', [], 'date', 'desc', groupId),
        services.patients.fetchPMSI(0, patientId, 'ghm', '', '', '', [], 'created', 'desc', groupId)
      ])

      if (fetchPatientResponse === undefined) return null

      const diagnosticList = linkElementWithEncounter(
        fetchPatientResponse[0].pmsiData as ICondition[],
        hospits,
        deidentified
      )
      const ccamList = linkElementWithEncounter(fetchPatientResponse[1].pmsiData as IProcedure[], hospits, deidentified)
      const ghmList = linkElementWithEncounter(fetchPatientResponse[2].pmsiData as IClaim[], hospits, deidentified)

      return {
        patientInfo: {
          lastGhm: ghmList ? (ghmList[0] as IClaim) : undefined,
          lastProcedure: ccamList ? (ccamList[0] as IProcedure) : undefined,
          mainDiagnosis: diagnosticList.filter(
            (diagnostic: any) => diagnostic.extension?.[0].valueString === 'dp'
          ) as ICondition[]
        },
        pmsi: {
          diagnostic: {
            loading: false,
            count: fetchPatientResponse[0].pmsiTotal ?? 0,
            total: fetchPatientResponse[0].pmsiTotal ?? 0,
            list: diagnosticList,
            page: 1
          },
          ccam: {
            loading: false,
            count: fetchPatientResponse[1].pmsiTotal ?? 0,
            total: fetchPatientResponse[1].pmsiTotal ?? 0,
            list: ccamList,
            page: 1
          },
          ghm: {
            loading: false,
            count: fetchPatientResponse[2].pmsiTotal ?? 0,
            total: fetchPatientResponse[2].pmsiTotal ?? 0,
            list: ghmList,
            page: 1
          }
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * fetchPatientInfo
 *
 */
type FetchPatientParams = {
  patientId: string
  groupId?: string
}
type FetchPatientReturn = {
  patientInfo: IPatient & {
    lastEncounter?: IEncounter
  }
  deidentified: boolean
  hospits?: {
    loading: boolean
    list: (CohortEncounter | IEncounter)[]
  }
} | null

const fetchPatientInfo = createAsyncThunk<FetchPatientReturn, FetchPatientParams, { state: RootState }>(
  'patient/fetchPatientInfo',
  async ({ patientId, groupId }, { dispatch }) => {
    try {
      const fetchPatientResponse = await services.patients.fetchPatientInfo(patientId, groupId)
      if (fetchPatientResponse === undefined) return null

      const { patientInfo, hospits, deidentifiedBoolean } = fetchPatientResponse

      dispatch(fetchLastPmsiInfo({ patientId, groupId }))

      return {
        patientInfo,
        deidentified: deidentifiedBoolean ?? false,
        hospits: {
          loading: false,
          list: hospits ?? []
        }
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const patientSlice = createSlice({
  name: 'patient',
  initialState: initialState as PatientState,
  reducers: {
    clearPatient: () => {
      return null
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => null)
    // fetchPatientInfo
    builder.addCase(fetchPatientInfo.pending, (state) =>
      state === null
        ? {
            loading: true,
            patientInfo: {
              resourceType: 'Patient',
              lastGhm: 'loading',
              lastProcedure: 'loading',
              mainDiagnosis: 'loading'
            }
          }
        : {
            ...state,
            loading: true,
            patientInfo: state.patientInfo
              ? state.patientInfo
              : {
                  resourceType: 'Patient',
                  lastGhm: 'loading',
                  lastProcedure: 'loading',
                  mainDiagnosis: 'loading'
                }
          }
    )
    builder.addCase(fetchPatientInfo.fulfilled, (state, action) =>
      action.payload === null
        ? null
        : action.payload.patientInfo.id === state?.patientInfo?.id
        ? {
            ...state,
            loading: false,
            deidentified: action.payload.deidentified,
            patientInfo: {
              ...action.payload.patientInfo,
              lastGhm: 'loading',
              lastProcedure: 'loading',
              mainDiagnosis: 'loading'
            },
            hospits: action.payload.hospits
          }
        : {
            ...state,
            loading: false,
            deidentified: action.payload.deidentified,
            patientInfo: {
              ...action.payload.patientInfo,
              lastGhm: 'loading',
              lastProcedure: 'loading',
              mainDiagnosis: 'loading'
            },
            hospits: action.payload.hospits,
            documents: undefined,
            pmsi: undefined,
            medication: undefined
          }
    )
    builder.addCase(fetchPatientInfo.rejected, () => null)
    builder.addCase(fetchLastPmsiInfo.fulfilled, (state, action) =>
      action.payload === null
        ? null
        : {
            ...state,
            loading: false,
            patientInfo: state?.patientInfo
              ? {
                  ...state?.patientInfo,
                  ...action.payload.patientInfo
                }
              : {
                  resourceType: 'Patient',
                  ...action.payload.patientInfo
                },
            pmsi: action.payload.pmsi
          }
    )
    builder.addCase(fetchLastPmsiInfo.rejected, () => null)
    builder.addCase(fetchAllProcedures.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            pmsi: state.pmsi
              ? {
                  ...state.pmsi,
                  ccam: state.pmsi.ccam
                    ? {
                        ...state.pmsi.ccam,
                        loading: true
                      }
                    : undefined,
                  diagnostic: state.pmsi.diagnostic
                    ? {
                        ...state.pmsi.diagnostic,
                        loading: true
                      }
                    : undefined
                }
              : undefined
          }
    )
    builder.addCase(fetchAllProcedures.fulfilled, (state, action) =>
      action.payload === undefined
        ? null
        : {
            ...state,
            loading: false,
            pmsi: state?.pmsi
              ? {
                  ...state?.pmsi,
                  ccam: action.payload.ccam,
                  diagnostic: action.payload.diagnostic
                }
              : {
                  ccam: action.payload.ccam,
                  diagnostic: action.payload.diagnostic
                }
          }
    )
    builder.addCase(fetchAllProcedures.rejected, () => null)
    builder.addCase(fetchDocuments.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            documents: state.documents
              ? {
                  ...state.documents,
                  loading: true
                }
              : undefined
          }
    )
    builder.addCase(fetchDocuments.fulfilled, (state, action) =>
      action.payload === undefined
        ? null
        : {
            ...state,
            loading: false,
            documents: action.payload.documents ?? undefined
          }
    )
    builder.addCase(fetchDocuments.rejected, () => null)
    builder.addCase(fetchPmsi.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            pmsi: state.pmsi
              ? {
                  ...state.pmsi,
                  diagnostic: state.pmsi.diagnostic
                    ? {
                        ...state.pmsi.diagnostic,
                        loading: true
                      }
                    : undefined,
                  ccam: state.pmsi.ccam
                    ? {
                        ...state.pmsi.ccam,
                        loading: true
                      }
                    : undefined,
                  ghm: state.pmsi.ghm
                    ? {
                        ...state.pmsi.ghm,
                        loading: true
                      }
                    : undefined
                }
              : {
                  diagnostic: undefined,
                  ccam: undefined,
                  ghm: undefined
                }
          }
    )
    builder.addCase(fetchPmsi.fulfilled, (state, action) =>
      action.payload === undefined || state === null
        ? null
        : {
            ...state,
            loading: false,
            pmsi: state.pmsi
              ? {
                  ...state.pmsi,
                  ...action.payload
                }
              : undefined
          }
    )
    builder.addCase(fetchPmsi.rejected, () => null)
    builder.addCase(fetchMedication.pending, (state) =>
      state === null
        ? null
        : {
            ...state,
            medication: state.medication
              ? {
                  ...state.medication,
                  administration: state.medication.administration
                    ? {
                        ...state.medication.administration,
                        loading: true
                      }
                    : undefined,
                  prescription: state.medication.prescription
                    ? {
                        ...state.medication.prescription,
                        loading: true
                      }
                    : undefined
                }
              : {
                  administration: undefined,
                  prescription: undefined
                }
          }
    )
    builder.addCase(fetchMedication.fulfilled, (state, action) =>
      action.payload === undefined || state === null
        ? null
        : {
            ...state,
            loading: false,
            medication: state.medication
              ? {
                  ...state.medication,
                  ...action.payload
                }
              : undefined
          }
    )
    builder.addCase(fetchMedication.rejected, () => null)
  }
})

export default patientSlice.reducer
export { fetchPatientInfo, fetchLastPmsiInfo, fetchAllProcedures, fetchDocuments, fetchPmsi, fetchMedication }
export const { clearPatient } = patientSlice.actions

function linkElementWithEncounter<
  T extends IProcedure | ICondition | IClaim | IComposition | IMedicationRequest | IMedicationAdministration
>(pmsiEntries: T[], listeEncounters: any[], deidentifiedBoolean: any) {
  let elementList: (T & {
    serviceProvider?: string
    NDA?: string
    documents?: any[]
  })[] = []

  for (const entry of pmsiEntries) {
    const newElement = entry as T & {
      serviceProvider?: string
      NDA?: string
      documents?: any[]
    }

    let encounterId = ''
    // @ts-ignore
    switch (entry.resourceType) {
      case 'Claim':
        encounterId = (entry as IClaim).item?.[0].encounter?.[0].reference?.replace(/^Encounter\//, '') ?? ''
        break
      case 'Procedure':
      case 'Condition':
        encounterId = (entry as IProcedure | ICondition).encounter?.reference?.replace(/^Encounter\//, '') ?? ''
        break
      case 'Composition':
        encounterId = (entry as IComposition).encounter?.display?.replace(/^Encounter\//, '') ?? ''
        break
      case 'MedicationRequest':
        encounterId = (entry as IMedicationRequest).encounter?.reference?.replace(/^Encounter\//, '') ?? ''
        break
      case 'MedicationAdministration':
        encounterId = (entry as IMedicationAdministration).context?.reference?.replace(/^Encounter\//, '') ?? ''
        break
    }
    const foundEncounter = listeEncounters.find(({ id }) => id === encounterId) || {}

    newElement.serviceProvider = foundEncounter?.serviceProvider?.display ?? 'Non renseigné'

    if (deidentifiedBoolean) {
      newElement.NDA = foundEncounter?.id ?? 'Inconnu'
    } else if (foundEncounter?.identifier) {
      const nda = foundEncounter.identifier.filter((identifier: IIdentifier) => {
        return identifier.type?.coding?.[0].code === 'NDA'
      })
      newElement.NDA = nda[0].value
    } else {
      newElement.NDA = 'Inconnu'
    }

    if (entry.resourceType !== 'Composition' && foundEncounter?.documents && foundEncounter.documents.length > 0) {
      newElement.documents = foundEncounter.documents
    }

    elementList = [...elementList, newElement]
  }

  return elementList
}

// function checkEqualityOfOptions(oldOptions: any, newOptions: any) {
//   let categories = Object.keys(newOptions)
//   // Remove page
//   categories = categories.filter((newKey: string) => newKey !== 'page')

//   for (const categorie of categories) {
//     const items = Object.keys(newOptions[categorie])
//     for (const item of items) {
//       if (Array.isArray(newOptions?.[categorie]?.[item])) {
//         if (oldOptions?.[categorie]?.[item]?.length !== newOptions?.[categorie]?.[item].length) {
//           return true
//         }
//       } else {
//         if (oldOptions?.[categorie]?.[item] !== newOptions?.[categorie]?.[item]) {
//           return true
//         }
//       }
//     }
//   }
//   return false
// }