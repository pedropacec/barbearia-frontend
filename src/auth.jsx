import { createContext, useContext, useState } from "react";
import { api, storeSession, clearSession, getStoredUser, getToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));

  async function login(email, password) {
    const { token, user } = await api.login(email, password);
    storeSession(token, user);
    setUser(user);
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
