import React, { useState } from 'react';
import Modal from "react-modal";
import "./number.css"

const NumberInputModal = ({ isOpen, onClose, onConfirm }) => {
  const [number, setNumber] = useState("");

  const handleChange = (e) => {
    setNumber(Number(e.target.value));
  };

  const handleConfirm = () => {
    onConfirm(number);
    onClose();
  };

  return (
    isOpen && (
      <div className="number-input-modal">
        <div className="modal-content">
          <Modal
            isOpen={isOpen}
            onRequestClose={handleConfirm}
            contentLabel="Bid Modal"
            className="custom-modal"
            //overlayClassName="custom-modal-overlay"
          >
            <div className="number-bar">
              <h2>Enter Bid</h2>
              <input type="range" min={0} max={100} value={number} onChange={handleChange} />
            </div>
            <div className="number-input">
              {number ? (
                <input type="number" value={number} onChange={handleChange} />
              ) : (
                <input type="number" placeholder="Enter a value" onChange={handleChange} />
              )}
            </div>
            <div className="modal-footer">
              <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
              <button className="cancel-button" onClick={onClose}>Cancel</button>
            </div>
          </Modal>
        </div>
      </div>
    )
  );
};

const NumberInputButton = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [number, setNumber] = useState(0);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleConfirm = (newNumber) => {
    setNumber(newNumber);
  };

  return (
    <div className="number-input-button">
      <p> Top bid {number}</p>
      <button className="input-button" onClick={openModal}>I want to bid</button>
      <NumberInputModal isOpen={modalIsOpen} onClose={closeModal} onConfirm={handleConfirm} />
    </div>
  );
};

export default NumberInputButton;

