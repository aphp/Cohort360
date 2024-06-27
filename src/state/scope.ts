import { createSlice } from '@reduxjs/toolkit'
import { impersonate, login, logout } from './me'
import { ScopeElement } from 'types'
import { Hierarchy } from 'types/hierarchy'

export type ScopeState = {
  rights: Hierarchy<ScopeElement, string>[]
  codes: Hierarchy<ScopeElement, string>[]
  openPopulation: number[]
}

const defaultInitialState: ScopeState = {
  rights: [],
  codes: [],
  openPopulation: []
}

const scopeSlice = createSlice({
  name: 'scope',
  initialState: defaultInitialState as ScopeState,
  reducers: {
    closeAllOpenedPopulation: (state) => {
      return {
        ...state,
        openPopulation: []
      }
    },
    saveRights: (state, action) => {
      return {
        ...state,
        rights: action.payload.rights || []
      }
    },
    saveFetchedCodes: (state, action) => {
      return {
        ...state,
        codes: action.payload || []
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
  }
})

export default scopeSlice.reducer
export const { closeAllOpenedPopulation, saveRights, saveFetchedCodes } = scopeSlice.actions
