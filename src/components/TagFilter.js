import React from 'react';
import './TagFilter.css';

function TagFilter({ tags, selectedTags, onTagToggle }) {
  if (tags.length === 0) {
    return null;
  }

  const handleTagClick = (tagId) => {
    onTagToggle(tagId);
  };

  return (
    <div className="tag-filter">
      <div className="tag-filter-label">FILTROS:</div>
      <div className="tag-list">
        {tags.map(tag => (
          <button
            key={tag.id}
            className={`tag-button ${selectedTags.includes(tag.id) ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTagClick(tag.id);
            }}
            type="button"
          >
            #{tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagFilter;

