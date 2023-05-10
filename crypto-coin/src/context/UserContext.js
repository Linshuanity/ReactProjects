import React, { createContext, useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 儲存使用者資訊到 IndexedDB
  const saveUserData = async (data) => {
    await set('user', data);
    setUser(data);
  }

  // 取得使用者資訊
  const getUserData = async () => {
    const data = await get('user');
    setUser(data);
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, saveUserData }}>
      {children}
    </UserContext.Provider>
  );
};
