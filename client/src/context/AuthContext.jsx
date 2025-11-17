import { createContext, useContext, useEffect, useState } from "react";
import { decodeData } from "../utils/jwt";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (data) => {
    setUser(data); // set user object from LoginDialog
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    // On mount, check for existing token in localStorage
    const token = localStorage.getItem("token");
    if (token) {
        const userData = decodeData(token);
        setUser(userData);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
