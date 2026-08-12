'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../canciones.module.css';

export default function FormCancion() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !lyrics) return;
    
    setLoading(true);
    await fetch('/api/canciones', {
      method: 'POST',
      body: JSON.stringify({ title, lyrics }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    router.push('/canciones');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Título de la Canción</label>
        <input 
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Carnaval Ayacuchano"
          required 
          className={styles.input}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Letra de la Canción</label>
        <textarea 
          value={lyrics}
          onChange={e => setLyrics(e.target.value)}
          placeholder="Escribe o pega la letra aquí..."
          required
          rows="12"
          className={styles.textarea}
        ></textarea>
      </div>
      <button type="submit" className={`btn btn-primary`} style={{width: '100%'}} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Canción'}
      </button>
    </form>
  );
}
