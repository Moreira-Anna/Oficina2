"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { JWTPayload } from '@/lib/auth'

interface AuthContextType {
  user: JWTPayload | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: {
    email: string
    password: string
    nome: string
    cargo: string
    idade?: number
    telefone?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isSupervisor: boolean
  isAluno: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<JWTPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        })
        response.then(res => res.json()).then(data => {
          if (data.success) {
            setUser(data.user)
          } else {
            localStorage.removeItem('token')
          }
        }).catch(() => {
          localStorage.removeItem('token')
        }).finally(() => {
          setIsLoading(false)
        })
      } catch {
        localStorage.removeItem('token')
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Erro ao fazer login' }
      }
    } catch {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const register = async (userData: {
    email: string
    password: string
    nome: string
    cargo: string
    idade?: number
    telefone?: string
  }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Erro ao registrar' }
      }
    } catch {
      return { success: false, error: 'Erro de conexão' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isSupervisor = user?.cargo === 'supervisor'
  const isAluno = user?.cargo === 'aluno'

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
      isSupervisor,
      isAluno
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
