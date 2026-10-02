import React, { useState } from 'react';
import { 
  FaFire, 
  FaMusic, 
  FaComments, 
  FaCalendarDays, 
  FaPaperclip, 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaShareNodes, 
  FaCirclePlay 
} from 'react-icons/fa6';

export default function Comunidad() {
  const [activeTab, setActiveTab] = useState('destacados');
  const [likedPosts, setLikedPosts] = useState({});

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white font-sans">
      {/* Banner Principal */}
      <section className="text-center py-12 px-4 bg-gradient-to-b from-[#66fcf1]/10 to-[#0b0c10]">
        <h1 className="text-4xl font-extrabold text-[#66fcf1] mb-2 tracking-wide uppercase">
          Comunidad GagaSonicos
        </h1>
        <p className="text-[#c5c6c7] max-w-xl mx-auto">
          Conéctate con otros DJs, comparte tus sets, opiniones y entérate de las últimas novedades.
        </p>
      </section>

      {/* Grid Principal */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Columna Izquierda: Sidebar de Navegación */}
        <aside className="space-y-4">
          <div className="bg-[#1f2833] p-5 rounded-xl border border-[#2c3540] shadow-lg">
            <h3 className="text-lg font-bold text-[#66fcf1] mb-4">Categorías</h3>
            <nav className="flex flex-col space-y-2">
              <button 
                onClick={() => setActiveTab('destacados')}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                  activeTab === 'destacados' ? 'bg-[#66fcf1]/10 text-[#66fcf1] font-semibold' : 'text-[#c5c6c7] hover:text-white'
                }`}
              >
                <FaFire /> Destacados
              </button>
              <button 
                onClick={() => setActiveTab('sets')}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                  activeTab === 'sets' ? 'bg-[#66fcf1]/10 text-[#66fcf1] font-semibold' : 'text-[#c5c6c7] hover:text-white'
                }`}
              >
                <FaMusic /> Compartir Sets
              </button>
              <button 
                onClick={() => setActiveTab('debate')}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                  activeTab === 'debate' ? 'bg-[#66fcf1]/10 text-[#66fcf1] font-semibold' : 'text-[#c5c6c7] hover:text-white'
                }`}
              >
                <FaComments /> Debate & Charla
              </button>
              <button 
                onClick={() => setActiveTab('eventos')}
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                  activeTab === 'eventos' ? 'bg-[#66fcf1]/10 text-[#66fcf1] font-semibold' : 'text-[#c5c6c7] hover:text-white'
                }`}
              >
                <FaCalendarDays /> Eventos
              </button>
            </nav>
          </div>

          <button className="w-full bg-[#66fcf1] text-black font-bold py-3 rounded-full hover:bg-[#45a29e] hover:shadow-[0_0_15px_#66fcf1] transition-all">
            + Crear Publicación
          </button>
        </aside>

        {/* Columna Central: Feed de Publicaciones */}
        <section className="md:col-span-2 space-y-6">
          
          {/* Formulario para publicar */}
          <div className="bg-[#1f2833] p-4 rounded-xl border border-[#2c3540] shadow-md">
            <textarea 
              className="w-full bg-[#0b0c10] text-white p-3 rounded-lg border border-[#2c3540] focus:border-[#66fcf1] focus:outline-none resize-none transition-colors"
              rows="3"
              placeholder="¿Qué estás escuchando o mezclando hoy?..."
            ></textarea>
            <div className="flex justify-between items-center mt-3">
              <button className="flex items-center gap-2 text-[#c5c6c7] hover:text-[#66fcf1] text-sm transition-colors">
                <FaPaperclip /> Adjuntar Set / Audio
              </button>
              <button className="bg-[#66fcf1] text-black font-bold px-5 py-2 rounded-full hover:bg-[#45a29e] transition-colors">
                Publicar
              </button>
            </div>
          </div>

          {/* Tarjeta de Publicación Ejemplo */}
          <article className="bg-[#1f2833] p-5 rounded-xl border border-[#2c3540] shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#66fcf1] text-black font-bold flex items-center justify-center">
                  DJ
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">DJ Alex Sonic</h4>
                  <span className="text-xs text-[#c5c6c7]">Hace 2 horas</span>
                </div>
              </div>
              <span className="bg-[#66fcf1]/20 text-[#66fcf1] text-xs font-semibold px-3 py-1 rounded-full">
                Sets & Mixes
              </span>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed">
              ¡Les comparto mi último set de Techno grabado este fin de semana! Dejen sus comentarios y feedbacks. 🎧🔥
            </p>

            {/* Reproductor / Preview de Media */}
            <div className="bg-[#0b0c10] p-4 rounded-lg border-l-4 border-[#66fcf1] flex items-center gap-4 cursor-pointer hover:bg-black/50 transition-colors">
              <FaCirclePlay className="text-3xl text-[#66fcf1]" />
              <div>
                <p className="font-bold text-sm text-white">Electro Session Vol. 4</p>
                <p className="text-xs text-[#c5c6c7]">Duración: 45:20 min</p>
              </div>
            </div>

            {/* Footer de Interacciones */}
            <div className="flex justify-around pt-3 border-t border-[#2c3540] text-sm text-[#c5c6c7]">
              <button 
                onClick={() => toggleLike(1)} 
                className={`flex items-center gap-2 transition-colors ${likedPosts[1] ? 'text-red-500' : 'hover:text-[#66fcf1]'}`}
              >
                {likedPosts[1] ? <FaHeart /> : <FaRegHeart />} {likedPosts[1] ? 25 : 24} Me gusta
              </button>
              <button className="flex items-center gap-2 hover:text-[#66fcf1] transition-colors">
                <FaComment /> 8 Comentarios
              </button>
              <button className="flex items-center gap-2 hover:text-[#66fcf1] transition-colors">
                <FaShareNodes /> Compartir
              </button>
            </div>
          </article>

        </section>

        {/* Columna Derecha: Ranking / Widgets */}
        <aside className="space-y-4">
          <div className="bg-[#1f2833] p-5 rounded-xl border border-[#2c3540] shadow-lg">
            <h3 className="text-lg font-bold text-[#66fcf1] mb-4">Top DJs de la Semana</h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3">
                  <span className="text-[#66fcf1] font-bold">1.</span> DJ BeatMaster
                </span>
                <span className="text-xs text-[#c5c6c7]">1.2k pts</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3">
                  <span className="text-[#66fcf1] font-bold">2.</span> ElectroQueen
                </span>
                <span className="text-xs text-[#c5c6c7]">980 pts</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-3">
                  <span className="text-[#66fcf1] font-bold">3.</span> GrooveLover
                </span>
                <span className="text-xs text-[#c5c6c7]">850 pts</span>
              </li>
            </ul>
          </div>
        </aside>

      </main>
    </div>
  );
}