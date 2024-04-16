import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { RootState } from 'state'
import { impersonate, login, logout } from './me'
import services from 'services/aphp'
import { ScopeListType } from 'types'
import { SourceValue } from 'types/scope'

export type ScopeState = {
  loading: boolean
  scopesList: ScopeListType
  openPopulation: number[]
  aborted?: boolean
}

const initialScopeList: ScopeListType = {
  perimeters: [],
  executiveUnits: []
}
const defaultInitialState: ScopeState = {
  loading: false,
  scopesList: initialScopeList,
  openPopulation: [],
  aborted: false
}

type FetchScopeListReturn = {
  scopesList: ScopeListType
  aborted?: boolean
}

type FetchScopeListArgs = {
  isScopeList?: boolean
  type?: SourceValue
  isExecutiveUnit?: boolean
  signal?: AbortSignal | undefined
}

const fetchScopesList = createAsyncThunk<FetchScopeListReturn, FetchScopeListArgs, { state: RootState }>(
  'scope/fetchScopesList',
  async ({ signal }, { getState }) => {
    try {
      const { me, scope } = getState()
      let perimeters = scope.scopesList.perimeters
      if (!perimeters.length) {
        if (!me) return { scopesList: initialScopeList, aborted: signal?.aborted }
        perimeters = (await services.perimeters.getRights({ practitionerId: me.id }, signal)).results
      }
      return {
        scopesList: {
          perimeters,
          executiveUnits: []
        },
        aborted: signal?.aborted
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const scopeSlice = createSlice({
  name: 'scope',
  initialState: defaultInitialState as ScopeState,
  reducers: {
    closeAllOpenedPopulation: (state) => {
      return {
        ...state,
        openPopulation: []
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
    builder.addCase(fetchScopesList.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchScopesList.fulfilled, (state, action) => ({
      ...state,
      loading: false,
      scopesList: action.payload.scopesList
    }))
    builder.addCase(fetchScopesList.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default scopeSlice.reducer
export { fetchScopesList }
export const { closeAllOpenedPopulation } = scopeSlice.actions
