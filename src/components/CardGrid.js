import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CardGrid.css';
import Card from './Card';
import LinkModal from './LinkModal';
import { useApi } from '../contexts/ApiContext';

function CardGrid({ cards, onUpdate, isAdmin }) {
  const { apiUrl } = useApi();
  const [selectedCard, setSelectedCard] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCardClick = async (card) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/cards/${card.id}/links`);
      setLinks(response.data);
      setSelectedCard(card);
    } catch (error) {
      console.error('Erro ao carregar links:', error);
      // Ainda abre o modal mesmo com erro 403 para mostrar a mensagem de acesso negado
      setSelectedCard(card);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
    setLinks([]);
  };

  if (cards.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-message">
          > NENHUM CARD ENCONTRADO
          <br />
          > AGUARDANDO DADOS...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card-grid">
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onClick={() => handleCardClick(card)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {selectedCard && (
        <LinkModal
          card={selectedCard}
          links={links}
          onClose={handleCloseModal}
          isAdmin={isAdmin}
          onUpdate={onUpdate}
        />
      )}
    </>
  );
}

export default CardGrid;

