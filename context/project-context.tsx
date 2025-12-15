"use client"

import React, { createContext, useContext, useReducer, ReactNode } from "react"

interface ProjectState {
  currentProject: any | null
  isLoading: boolean
  error: string | null
}

type ProjectAction =
  | { type: "SET_PROJECT"; payload: any }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_PROJECT" }

const initialState: ProjectState = {
  currentProject: null,
  isLoading: false,
  error: null,
}

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case "SET_PROJECT":
      return { ...state, currentProject: action.payload, error: null }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "CLEAR_PROJECT":
      return { ...initialState }
    default:
      return state
  }
}

interface ProjectContextType {
  state: ProjectState
  setProject: (project: any) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearProject: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState)

  const setProject = (project: any) => {
    dispatch({ type: "SET_PROJECT", payload: project })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error })
  }

  const clearProject = () => {
    dispatch({ type: "CLEAR_PROJECT" })
  }

  return (
    <ProjectContext.Provider
      value={{
        state,
        setProject,
        setLoading,
        setError,
        clearProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider")
  }
  return context
}
