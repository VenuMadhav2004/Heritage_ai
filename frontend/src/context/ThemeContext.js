import { createContext, useContext } from "react";
const ThemeCtx = createContext({ theme:"dark" });
export function ThemeProvider({ children }) { return <ThemeCtx.Provider value={{ theme:"dark" }}>{children}</ThemeCtx.Provider>; }
export const useTheme = () => useContext(ThemeCtx);
