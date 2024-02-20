import React, { createContext, useContext, useState } from 'react';
import 'components/Message.css';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const showMessage = (msg) => {
    setMessage(msg);
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 3000); // 3秒后隐藏消息
  };

  return (
    <MessageContext.Provider value={{ message, isVisible, showMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => useContext(MessageContext);
