import React from "react";
import { Modal, Button } from "react-bootstrap";

function ConfirmModal({ show, onHide, onConfirm, title, message }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || "Confirmar acción"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message || "¿Estás seguro que deseas continuar?"}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;