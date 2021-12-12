import React, { useState, createContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { Loading } from '../components/Loading';

export const Context = createContext<any>({});

export const ContextProvider = (props) => {
  const [name, setName] = useState<any>('');
  const [email, setEmail] = useState<any>('');
  const [password, setPassword] = useState<any>('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<any>(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <Loading />;
  }

  const value = {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    setLoading,
  };

  return <Context.Provider value={value}>{props.children}</Context.Provider>;
};
