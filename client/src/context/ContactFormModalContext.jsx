import { createContext, useContext, useState } from "react";

const ContactFormModalContext = createContext(null);

export const ContactFormModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ContactFormModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ContactFormModalContext.Provider>
  );
};

export const useContactFormModal = () => {
  const ctx = useContext(ContactFormModalContext);
  if (!ctx) throw new Error("useContactFormModal must be used within ContactFormModalProvider");
  return ctx;
};
