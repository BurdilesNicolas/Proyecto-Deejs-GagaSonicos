import React, { useState } from 'react';
import '../estilos/App.css'; 

export default function Comunidad() {
    //reseñas de ejemplo
    const [resenas, setResenas] = useState([
        {
            id: 1,
            usuario: 'Ana Vinyl',
            album: 'Blonde - Frank Ocean',
            calificacion: 5,
            comentario: 'La edición en vinilo suena impecable. La calidez del audio analógico realza muchísimo la producción del álbum.',
            fecha: '2026-03-10'
        },
        {
            id: 2,
            usuario: 'Diego_Tape',
            album: 'channel ORANGE - Frank Ocean',
            calificacion: 4,
            comentario: 'El cassette llegó en excelentes condiciones. ¡Muy recomendado para coleccionistas!',
            fecha: '2026-03-12'
        }
    ]);

    //estado para el formulario de nueva reseña
    const [nuevoUsuario, setNuevoUsuario] = useState('');
    const [nuevoAlbum, setNuevoAlbum] = useState('');
    const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
    const [nuevoComentario, setNuevoComentario] = useState('');

    //agregar una reseña al enviar el formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nuevoUsuario || !nuevoAlbum || !nuevoComentario) {
            alert('Por favor completa todos los campos.');
            return;
        }

        const nuevaResenaObj = {
            id: Date.now(),
            usuario: nuevoUsuario,
            album: nuevoAlbum,
            calificacion: Number(nuevaCalificacion),
            comentario: nuevoComentario,
            fecha: new Date().toISOString().split('T')[0]
        };

        setResenas([nuevaResenaObj, ...resenas]);

        //limpiar formulario
        setNuevoUsuario('');
        setNuevoAlbum('');
        setNuevaCalificacion(5);
        setNuevoComentario('');
    };

    return (
        <div className="comunidad-container" style={{ padding: '2rem', color: '#fff', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Comunidad DEEJ's 🎵</h1>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#ccc' }}>
                Comparte tus opiniones, reseñas y recomendaciones de tus álbumes, vinilos y cassettes favoritos con otros melómanos.
            </p>
            /*---*/
            {/*lista reseña*/}
            <section style={{ marginTop: '2.5rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.4rem' }}>Reseñas recientes</h2>
                {resenas.map((item) => (
                    <div key={item.id} className="glass-card" style={{ ...styles.card, marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#a78bfa' }}>{item.album}</h3>
                            <span style={{ color: '#fbbf24' }}>{'★'.repeat(item.calificacion)}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '0.3rem 0 0.8rem 0' }}>
                            Por <strong>{item.usuario}</strong> - {item.fecha}
                        </p>
                        <p style={{ margin: 0, lineHeight: '1.4' }}>{item.comentario}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
//estilos rapidos en objeto js
const styles = {
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
        textAlign: 'left'
    },
    input: {
        padding: '0.6rem 0.8rem',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        color: '#fff',
        fontSize: '0.95rem'
    },
    button: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#6d28d9',
        color: '#fff',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '0.5rem',
        transition: 'background-color 0.2s'
    }
};