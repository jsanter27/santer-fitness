import React from 'react';
import { Modal } from 'react-bootstrap';
import { DARK } from '../constants/Colors';

const SFModal = (props) => {

    if (props.message) {
        return (
            <Modal show={props.show} onHide={props.onHide} className="sf-modal">
                <Modal.Header className="sf-modal-header" closeButton>
                    <Modal.Title className="sf-modal-title" style={{color:(props.message.msgError ? "red" : DARK)}}>
                        <b>{props.message.msgError ? "Error" : ""}</b>
                        <b>{!props.message.msgError && props.message.msgBody.trim() !== '' ? "Success" : ""}</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="sf-modal-body">
                        {props.message.msgBody}
                </Modal.Body>
            </Modal>
        );
    }
    else {
        return (
            <Modal show={props.show} onHide={props.onHide} className="sf-modal">
                <Modal.Header className="sf-modal-header" closeButton>
                    <Modal.Title className="sf-modal-title" style={{color:DARK}}>
                        <b>Complete</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="sf-modal-body">
                        Please verify that the action has completed
                </Modal.Body>
            </Modal>
        );
    }
};

export default SFModal;