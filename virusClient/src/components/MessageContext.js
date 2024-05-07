import React, { createContext, useContext, useState } from 'react';
import 'components/Message.css';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [messageClass, setMessageClass] = useState('message-box-green'); // Default to green

  const showMessage = (msg, timeout, colorClass) => {
    setMessage(msg);
    setMessageClass(colorClass); // Set the message box color class
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, timeout); // Hide message after timeout
  };

  return (
    <MessageContext.Provider value={{ message, isVisible, showMessage }}>
    {isVisible && ( 
      <div className={`message-box ${messageClass}`}>
        {message}
      </div>
    )}
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => useContext(MessageContext);
