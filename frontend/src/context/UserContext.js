import { createContext, useContext, useState } from "react";
const UserCtx = createContext(null);
export function UserProvider({ children }) {
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("tn_favorites") || "[]"));
  const addFav    = (site) => { const u = [site, ...favorites.filter(f=>f.id!==site.id)]; setFavorites(u); localStorage.setItem("tn_favorites",JSON.stringify(u)); };
  const removeFav = (id)   => { const u = favorites.filter(f=>f.id!==id); setFavorites(u); localStorage.setItem("tn_favorites",JSON.stringify(u)); };
  const isFav     = (id)   => favorites.some(f=>f.id===id);
  return <UserCtx.Provider value={{ favorites, addFav, removeFav, isFav }}>{children}</UserCtx.Provider>;
}
export const useUser = () => useContext(UserCtx);
