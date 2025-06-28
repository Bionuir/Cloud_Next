import { useState } from 'react';

export default function PopupTiposTerapeuta({ tipo, onClose }) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // duración de la animación fadeOut
  };

  return (
    <div className="popup-overlay" onClick={handleClose} data-closing={closing}>
      <div className="popup-card" onClick={e => e.stopPropagation()}>
        <div className="popup-header">{tipo.nombre}</div>
        <div className="popup-body">
          <div className="popup-labels">
            <div>Tipo:</div>
            <div>Descripción:</div>
          </div>
          <div className="popup-values">
            <div>{tipo.tipo}</div>
            <div>{tipo.descripcion}</div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn 0.3s;
          z-index: 1000;
        }
        .popup-overlay[data-closing="true"] {
          animation: fadeOut 0.3s forwards;
        }
        .popup-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
          max-width: 30%;
          animation: fadeIn 0.3s;
        }
        .popup-header {
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 1rem;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.5rem;
        }
        .popup-body {
          display: flex;
          margin-top: 1rem;
        }
        .popup-labels,
        .popup-values {
          width: 50%;
        }
        .popup-labels {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-weight: bold;
        }
        .popup-values {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
