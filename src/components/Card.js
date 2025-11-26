import React, { useState } from 'react';
import './Card.css';

function Card({ card, onClick, isAdmin }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="card" onClick={onClick}>
      <div className="card-content">
        {card.thumbnail_url && !imageError ? (
          <div className="card-thumbnail">
            <img 
              src={card.thumbnail_url} 
              alt={card.title} 
              onError={() => setImageError(true)}
            />
          </div>
        ) : card.icon && (
          <div className="card-icon">{card.icon}</div>
        )}
        <h3 className="card-title">{card.title}</h3>
        {card.description && (
          <p className="card-description">{card.description}</p>
        )}
        {card.tag_names && card.tag_names.length > 0 && (
          <div className="card-tags">
            {card.tag_names.map((tagName, index) => (
              <span key={index} className="card-tag">
                #{tagName}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="card-glow"></div>
    </div>
  );
}

export default Card;

