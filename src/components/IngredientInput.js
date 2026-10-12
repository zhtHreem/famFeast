import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';
import api from '../api';

let vocabPromise = null;
const loadVocabulary = () => {
  if (!vocabPromise) {
    vocabPromise = api.get('/pantry/ingredients', { params: { all: 1 } }).then((r) => r.data).catch(() => {
      vocabPromise = null;
      return [];
    });
  }
  return vocabPromise;
};

// Chip input with autocomplete suggestions from the recipe database. Free text is allowed too.
export default function IngredientInput({ value, onChange, label = 'Ingredients you have', placeholder = 'Type e.g. eggs, then press Enter', autoFocus }) {
  const [vocab, setVocab] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    let alive = true;
    loadVocabulary().then((v) => alive && setVocab(v));
    return () => {
      alive = false;
    };
  }, []);

  const options = useMemo(() => {
    const q = input.trim().toLowerCase();
    const pool = vocab.filter((o) => !value.includes(o));
    if (!q) return pool.slice(0, 30);
    return [...pool.filter((o) => o.startsWith(q)), ...pool.filter((o) => !o.startsWith(q) && o.includes(q))].slice(0, 12);
  }, [vocab, input, value]);

  const normalize = (list) => [...new Set(list.map((s) => String(s).trim().toLowerCase()).filter(Boolean))];

  return (
    <Autocomplete
      multiple
      freeSolo
      autoHighlight
      options={options}
      value={value}
      inputValue={input}
      onInputChange={(_, v, reason) => {
        // Commas act like Enter so people can paste "eggs, rice, onion"
        if (reason === 'input' && v.includes(',')) {
          const parts = v.split(',');
          onChange(normalize([...value, ...parts.slice(0, -1)]));
          setInput(parts[parts.length - 1].trimStart());
        } else {
          setInput(v);
        }
      }}
      onChange={(_, v) => onChange(normalize(v))}
      filterOptions={(x) => x}
      renderTags={(tags, getTagProps) =>
        tags.map((tag, index) => {
          const { key, ...rest } = getTagProps({ index });
          return <Chip key={key} label={tag} color="primary" variant="outlined" size="small" {...rest} />;
        })
      }
      renderInput={(params) => <TextField {...params} label={label} placeholder={value.length ? '' : placeholder} autoFocus={autoFocus} />}
    />
  );
}
