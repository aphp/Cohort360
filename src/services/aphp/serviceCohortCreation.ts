import { AxiosResponse } from 'axios'
import apiBack from '../apiBackend'

import {
  Back_API_Response,
  Cohort,
  CountCohort,
  DatedMeasure,
  FetchRequest,
  HierarchyElement,
  HierarchyElementWithSystem,
  QuerySnapshotInfo,
  RequestType,
  Snapshot
} from 'types'
import docTypes from 'assets/docTypes.json'
import { ValueSetWithHierarchy, fetchBiologySearch } from './cohortCreation/fetchObservation'
import {
  BIOLOGY_HIERARCHY_ITM_ANABIO,
  BIOLOGY_HIERARCHY_ITM_LOINC,
  CLAIM_HIERARCHY,
  CONDITION_HIERARCHY,
  CONDITION_STATUS,
  DEMOGRAPHIC_GENDER,
  ENCOUNTER_ADMISSION,
  ENCOUNTER_ADMISSION_MODE,
  ENCOUNTER_DESTINATION,
  ENCOUNTER_ENTRY_MODE,
  ENCOUNTER_EXIT_MODE,
  ENCOUNTER_EXIT_TYPE,
  ENCOUNTER_FILE_STATUS,
  ENCOUNTER_PROVENANCE,
  ENCOUNTER_SEJOUR_TYPE,
  ENCOUNTER_VISIT_TYPE,
  IMAGING_MODALITIES,
  MEDICATION_ADMINISTRATIONS,
  MEDICATION_ATC,
  MEDICATION_UCD,
  MEDICATION_PRESCRIPTION_TYPES,
  PROCEDURE_HIERARCHY,
  SHORT_COHORT_LIMIT
} from '../../constants'
import { fetchSingleCodeHierarchy, fetchValueSet } from './callApi'
import { DocType } from 'types/requestCriterias'
import { Direction, Order, VitalStatusLabel } from 'types/searchCriterias'

export interface IServiceCohortCreation {
  /**
   * Cette fonction permet de créer une cohorte à partir d'une requete dans le requeteur
   */
  createCohort: (
    requeteurJson?: string,
    datedMeasureId?: string,
    snapshotId?: string,
    requestId?: string,
    cohortName?: string,
    cohortDescription?: string,
    globalCount?: boolean
  ) => Promise<AxiosResponse<Cohort> | null>

  /**
   * Cette fonction permet de récupérer le count d'une requête
   */
  countCohort: (
    requeteurJson?: string,
    snapshotId?: string,
    requestId?: string,
    uuid?: string
  ) => Promise<CountCohort | null>

  /**
   * Cette fonction permet de créer un état de `snapshot` pour l'historique d'une requête
   */
  createSnapshot: (id: string, json: string, firstTime?: boolean) => Promise<Snapshot | null>

  /**
   * Cette fonction permet de faire une demande de rapport de faisabilité
   */
  createReport: (id: string) => Promise<AxiosResponse>

  /**
   * Permet de récupérer toutes les informations utiles pour l'utilisation du requeteur
   */
  fetchRequest: (requestId: string, snapshotId?: string) => Promise<FetchRequest>

  fetchSnapshot: (snapshotId: string) => Promise<Snapshot>

  fetchAdmissionModes: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchEntryModes: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchExitModes: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchPriseEnChargeType: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchTypeDeSejour: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchFileStatus: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchReason: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchDestination: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchProvenance: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchAdmission: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchGender: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchStatus: () => Promise<Array<HierarchyElement>>
  fetchStatusDiagnostic: () => Promise<Array<HierarchyElement>>
  fetchDiagnosticTypes: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchCim10Diagnostic: (
    searchValue?: string,
    exactSearch?: boolean,
    signal?: AbortSignal
  ) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchCim10Hierarchy: (cim10Parent?: string) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchCcamData: (
    searchValue?: string,
    exactSearch?: boolean,
    signal?: AbortSignal
  ) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchCcamHierarchy: (ccamParent: string) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchGhmData: (
    searchValue?: string,
    exactSearch?: boolean,
    signal?: AbortSignal
  ) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchGhmHierarchy: (ghmParent: string) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchDocTypes: () => Promise<DocType[]>
  fetchMedicationData: (
    searchValue?: string,
    exactSearch?: boolean,
    signal?: AbortSignal
  ) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchSingleCodeHierarchy: (resourceType: string, code: string) => Promise<string[]>
  fetchAtcHierarchy: (atcParent: string) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchUCDList: (ucd?: string) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchPrescriptionTypes: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchAdministrations: () => Promise<Array<HierarchyElement>>
  fetchBiologyData: () => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchBiologyHierarchy: (biologyParent?: string) => Promise<Back_API_Response<HierarchyElementWithSystem>>
  fetchBiologySearch: (
    searchInput: string
  ) => Promise<{ anabio: ValueSetWithHierarchy[]; loinc: ValueSetWithHierarchy[] }>
  fetchModalities: () => Promise<Array<HierarchyElement>>
}

const servicesCohortCreation: IServiceCohortCreation = {
  createCohort: async (
    requeteurJson,
    datedMeasureId,
    snapshotId,
    requestId,
    cohortName,
    cohortDescription,
    globalCount
  ) => {
    if (!requeteurJson || !datedMeasureId || !snapshotId || !requestId) return null
    if (globalCount === undefined) globalCount = false

    const cohortResult = await apiBack.post<Cohort>('/cohort/cohorts/', {
      dated_measure_id: datedMeasureId,
      request_query_snapshot_id: snapshotId,
      request_id: requestId,
      name: cohortName,
      description: cohortDescription,
      global_estimate: globalCount
    })

    return cohortResult
  },

  countCohort: async (requeteurJson?: string, snapshotId?: string, requestId?: string, uuid?: string) => {
    if (uuid) {
      const measureResult = await apiBack.get<DatedMeasure>(`/cohort/dated-measures/${uuid}/`)

      return {
        date: measureResult?.data?.created_at,
        status: measureResult?.data?.request_job_status,
        jobFailMsg: measureResult?.data?.request_job_fail_msg,
        uuid: measureResult?.data?.uuid,
        includePatient: measureResult?.data?.measure,
        byrequest: 0,
        count_outdated: measureResult?.data?.count_outdated,
        shortCohortLimit: measureResult?.data?.cohort_limit
      } as CountCohort
    } else {
      if (!requeteurJson || !snapshotId || !requestId) return null

      const measureResult = await apiBack.post<DatedMeasure>('/cohort/dated-measures/', {
        request_query_snapshot_id: snapshotId,
        request_id: requestId
      })

      return {
        date: measureResult?.data?.created_at,
        status: measureResult?.data?.request_job_status ?? 'error',
        uuid: measureResult?.data?.uuid,
        count_outdated: measureResult?.data?.count_outdated,
        shortCohortLimit: measureResult?.data?.cohort_limit
      } as CountCohort
    }
  },

  createSnapshot: async (id, json, firstTime) => {
    const data = {
      [firstTime ? 'request_id' : 'previous_snapshot_id']: id,
      serialized_query: json
    }
    const snapshot = (await apiBack.post<Snapshot>('/cohort/request-query-snapshots/', data)) || {}
    return snapshot && snapshot.data ? snapshot.data : null
  },

  createReport: async (id) => {
    const data = { request_query_snapshot_id: id }

    const reportResponse = (await apiBack.post('/cohort/feasibility-studies/', data)) || {}
    return reportResponse
  },

  fetchRequest: async (requestId, snapshotId) => {
    const requestResponse: AxiosResponse = (await apiBack.get<RequestType>(`/cohort/requests/${requestId}/`)) || {}
    const requestData: RequestType = requestResponse?.data ? requestResponse.data : {}

    const query_snapshots: QuerySnapshotInfo[] = requestData.query_snapshots ? requestData.query_snapshots : []

    const requestName = requestData.name

    let snapshotsHistoryFromQuery: QuerySnapshotInfo[] = query_snapshots

    snapshotsHistoryFromQuery = snapshotsHistoryFromQuery.sort(
      ({ created_at: a }, { created_at: b }) => new Date(b).valueOf() - new Date(a).valueOf()
    )

    let currentSnapshotResponse: AxiosResponse | null = null

    if (snapshotId || snapshotsHistoryFromQuery?.length > 0) {
      currentSnapshotResponse = await apiBack.get<Snapshot>(
        `/cohort/request-query-snapshots/${snapshotId ? snapshotId : snapshotsHistoryFromQuery?.[0].uuid}/`
      )
    }

    let currentSnapshot: Snapshot | null = currentSnapshotResponse?.data ? currentSnapshotResponse?.data : null

    let result = null
    let shortCohortLimit = SHORT_COHORT_LIMIT
    let count_outdated = false

    if (currentSnapshot) {
      // clean Global count
      currentSnapshot = {
        ...currentSnapshot,
        dated_measures: currentSnapshot.dated_measures.filter(
          (dated_measure: DatedMeasure) => dated_measure.mode !== 'Global'
        )
      }

      shortCohortLimit =
        currentSnapshot.dated_measures.length > 0 ? currentSnapshot.dated_measures?.[0].cohort_limit ?? 0 : 0

      count_outdated =
        currentSnapshot.dated_measures.length > 0 ? currentSnapshot.dated_measures?.[0].count_outdated ?? false : false
    }

    result = {
      requestName,
      snapshotsHistory: snapshotsHistoryFromQuery ? snapshotsHistoryFromQuery : [],
      json: currentSnapshot ? currentSnapshot.serialized_query : '',
      currentSnapshot: currentSnapshot ? currentSnapshot : {},
      count: currentSnapshot ? currentSnapshot.dated_measures[0] : {},
      shortCohortLimit,
      count_outdated
    } as FetchRequest
    return result
  },

  fetchSnapshot: async (snapshotId) => {
    const snapshotResponse: AxiosResponse =
      (await apiBack.get<Snapshot>(`/cohort/request-query-snapshots/${snapshotId}/`)) || {}

    return snapshotResponse.data || {}
  },

  fetchAdmissionModes: async () =>
    fetchValueSet(ENCOUNTER_ADMISSION_MODE, {
      joinDisplayWithCode: false
    }),
  fetchEntryModes: async () =>
    fetchValueSet(ENCOUNTER_ENTRY_MODE, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchExitModes: async () =>
    fetchValueSet(ENCOUNTER_EXIT_MODE, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchPriseEnChargeType: async () =>
    fetchValueSet(ENCOUNTER_VISIT_TYPE, {
      joinDisplayWithCode: false,
      filterOut: (value) => value.id === 'nachstationär' || value.id === 'z.zt. verlegt'
    }),
  fetchTypeDeSejour: async () =>
    fetchValueSet(ENCOUNTER_SEJOUR_TYPE, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchFileStatus: async () =>
    fetchValueSet(ENCOUNTER_FILE_STATUS, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchReason: async () =>
    fetchValueSet(ENCOUNTER_EXIT_TYPE, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchDestination: async () =>
    fetchValueSet(ENCOUNTER_DESTINATION, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchProvenance: async () =>
    fetchValueSet(ENCOUNTER_PROVENANCE, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchAdmission: async () =>
    fetchValueSet(ENCOUNTER_ADMISSION, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchGender: async () =>
    fetchValueSet(DEMOGRAPHIC_GENDER, {
      joinDisplayWithCode: false,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC }
    }),
  fetchStatus: async () => {
    return [
      {
        id: 'false',
        label: VitalStatusLabel.ALIVE
      },
      {
        id: 'true',
        label: VitalStatusLabel.DECEASED
      }
    ]
  },
  fetchStatusDiagnostic: async () => {
    return [
      {
        id: 'actif',
        label: 'Actif'
      },
      {
        id: 'supp',
        label: 'Supprimé'
      }
    ]
  },
  fetchDiagnosticTypes: async () => fetchValueSet(CONDITION_STATUS),
  fetchCim10Diagnostic: async (searchValue?: string, exactSearch?: boolean, signal?: AbortSignal) =>
    fetchValueSet(
      CONDITION_HIERARCHY,
      {
        valueSetTitle: 'Toute la hiérarchie',
        search: searchValue || '',
        exactSearch
      },
      signal
    ),
  fetchCim10Hierarchy: async (cim10Parent?: string) =>
    fetchValueSet(CONDITION_HIERARCHY, { valueSetTitle: 'Toute la hiérarchie CIM10', code: cim10Parent }),
  fetchCcamData: async (searchValue?: string, exactSearch?: boolean, signal?: AbortSignal) =>
    fetchValueSet(
      PROCEDURE_HIERARCHY,
      { valueSetTitle: 'Toute la hiérarchie', search: searchValue || '', exactSearch },
      signal
    ),
  fetchCcamHierarchy: async (ccamParent?: string) =>
    fetchValueSet(PROCEDURE_HIERARCHY, { valueSetTitle: 'Toute la hiérarchie CCAM', code: ccamParent }),
  fetchGhmData: async (searchValue?: string, exactSearch?: boolean, signal?: AbortSignal) =>
    fetchValueSet(
      CLAIM_HIERARCHY,
      { valueSetTitle: 'Toute la hiérarchie', search: searchValue || '', exactSearch },
      signal
    ),
  fetchGhmHierarchy: async (ghmParent?: string) =>
    fetchValueSet(CLAIM_HIERARCHY, { valueSetTitle: 'Toute la hiérarchie GHM', code: ghmParent }),
  fetchDocTypes: () => Promise.resolve(docTypes && docTypes.docTypes.length > 0 ? docTypes.docTypes : []),
  fetchMedicationData: async (searchValue?: string, exactSearch?: boolean, signal?: AbortSignal) =>
    fetchValueSet(
      `${MEDICATION_ATC},${MEDICATION_UCD}`,
      {
        valueSetTitle: 'Toute la hiérarchie',
        search: searchValue || '',
        exactSearch
      },
      signal
    ),
  fetchSingleCodeHierarchy: async (resourceType: string, code: string) => {
    const codeSystemPerResourceType: { [type: string]: string } = {
      Claim: CLAIM_HIERARCHY,
      Condition: CONDITION_HIERARCHY,
      MedicationAdministration: `${MEDICATION_ATC},${MEDICATION_UCD}`,
      MedicationRequest: `${MEDICATION_ATC},${MEDICATION_UCD}`,
      Observation: `${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}`,
      Procedure: PROCEDURE_HIERARCHY
    }
    if (!(resourceType in codeSystemPerResourceType)) {
      // TODO log error
      return Promise.resolve([] as string[])
    }
    return fetchSingleCodeHierarchy(codeSystemPerResourceType[resourceType], code)
  },
  fetchAtcHierarchy: async (atcParent?: string) =>
    fetchValueSet(MEDICATION_ATC, {
      valueSetTitle: 'Toute la hiérarchie Médicament',
      code: atcParent,
      orderBy: { orderBy: Order.CODE, orderDirection: Direction.ASC },
      filterRoots: (atcData) =>
        // V--[ @TODO: This is a hot fix, remove this after a clean of data ]--V
        atcData.label.search(new RegExp(/^[A-Z] - /, 'gi')) !== -1 &&
        atcData.label.search(new RegExp(/^[X-Y] - /, 'gi')) !== 0
    }),
  fetchUCDList: async (ucd?: string) => fetchValueSet(MEDICATION_UCD, { code: ucd }),
  fetchPrescriptionTypes: async () => fetchValueSet(MEDICATION_PRESCRIPTION_TYPES, { joinDisplayWithCode: false }),
  fetchAdministrations: async () => {
    const administrations = await fetchValueSet(MEDICATION_ADMINISTRATIONS, { joinDisplayWithCode: false })
    return (administrations.results || []).map((administration) =>
      administration.id === 'GASTROTOMIE.' ? { ...administration, label: 'Gastrotomie.' } : administration
    )
  },
  fetchBiologyData: async (searchValue?: string, exactSearch?: boolean) =>
    fetchValueSet(`${BIOLOGY_HIERARCHY_ITM_ANABIO},${BIOLOGY_HIERARCHY_ITM_LOINC}`, {
      valueSetTitle: 'Toute la hiérarchie',
      search: searchValue || '',
      exactSearch,
      joinDisplayWithCode: false
    }),
  fetchBiologyHierarchy: async (biologyParent?: string) =>
    fetchValueSet(BIOLOGY_HIERARCHY_ITM_ANABIO, {
      valueSetTitle: 'Toute la hiérarchie de Biologie',
      code: biologyParent,
      joinDisplayWithCode: false,
      filterRoots: (biologyItem) =>
        biologyItem.id !== '527941' &&
        biologyItem.id !== '547289' &&
        biologyItem.id !== '528247' &&
        biologyItem.id !== '981945' &&
        biologyItem.id !== '834019' &&
        biologyItem.id !== '528310' &&
        biologyItem.id !== '528049' &&
        biologyItem.id !== '527570' &&
        biologyItem.id !== '527614'
    }),
  fetchBiologySearch: fetchBiologySearch,
  fetchModalities: async () => {
    const modalities = await fetchValueSet(IMAGING_MODALITIES, { joinDisplayWithCode: false })
    return (modalities.results || []).map((modality) => ({ ...modality, label: `${modality.id} - ${modality.label}` }))
  }
}

export default servicesCohortCreation
