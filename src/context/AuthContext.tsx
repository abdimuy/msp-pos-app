import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean
  user?: any
}

type AuthAction =
  | { type: 'LOGIN'; payload: any }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { isAuthenticated: true, user: action.payload }
    case 'LOGOUT':
      return { isAuthenticated: false, user: null }
    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  login: (user: any) => void
  logout: () => void
} | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (user: any) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  useEffect(() => {
    const cargarUsuario = async () => {
      const usuarioGuardado = await AsyncStorage.getItem('user');
      if (usuarioGuardado) {
        dispatch({ type: 'LOGIN', payload: JSON.parse(usuarioGuardado) });
      }
    };
    cargarUsuario();
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}