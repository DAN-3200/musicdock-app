import { useEffect, useRef, useState } from "react";
import { SongController } from "../src/infra/song.controller";
import { WindowMinimise } from "../wailsjs/runtime";
import { DownloadSong, GetSearchSuggestions, SaveSongDialog, SearchVideos } from "../wailsjs/go/handlers/Handler";
import { NativeCommands } from "../src/infra/commands.native";

export const PageTestView = () => {
   const [volume, setVolume] = useState(25);
   const [search, setSearch] = useState('');
   const [url, setUrl] = useState('');
   const [currentTime, setCurrentTime] = useState(0);
   const [duration, setDuration] = useState(0); // Estado para a duração total
   const songRef = useRef<SongController | null>(null);

   useEffect(() => {
      (async () => {
         if (!url) return;

         const testUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

         // Instancia o novo controller
         const ad = new SongController(await NativeCommands.GetAudioUrl(url));
         ad.setVolume(volume);
         songRef.current = ad;

         // Intervalo para atualizar o progresso e a duração
         const interval = setInterval(() => {
            if (songRef.current) {
               setCurrentTime(songRef.current.progress);
               // Atualiza a duração caso ela mude (após carregar metadados)
               if (duration !== songRef.current.duration) {
                  setDuration(songRef.current.duration);
               }
            }
         }, 500);

         return () => {
            clearInterval(interval);
            ad.pause(); // Importante para não vazar áudio
         };
      })()

   }, [url]);

   // Sincroniza apenas o volume sem reiniciar a música
   useEffect(() => {
      songRef.current?.setVolume(volume);
   }, [volume]);

   const [isDownloading, setIsDownloading] = useState(false);

   const handleDownload = async () => {
      setIsDownloading(true);

      // 1. Abre o diálogo nativo do Windows
      const path = await SaveSongDialog("minha_musica");

      if (!path) return; // Usuário cancelou o diálogo

      // 2. Inicia o processo de stream para o arquivo

      try {
         // Chama a função Go através do Wails runtime
         await DownloadSong(url, path);
         alert("Download concluído com sucesso!");
      } catch (err) {
         alert("Erro ao baixar: " + err);
      } finally {
         setIsDownloading(false);
      }
   };

   return (
      <div className="p-4 text-white gap-4 flex flex-col bg-zinc-900 rounded-lg wails-draggable">
         <div className="flex gap-2">
            <button className="bg-emerald-600 px-3 py-1 rounded" onClick={() => songRef.current?.play()}>PLAY</button>
            <button className="bg-amber-600 px-3 py-1 rounded" onClick={() => songRef.current?.pause()}>PAUSE</button>
            <button className="bg-red-600 px-3 py-1 rounded" onClick={() => WindowMinimise()}>EXIT</button>
         </div>

         {/* Campo de Busca/URL */}
         <input
            className="bg-zinc-800 ring-1 ring-white/20 px-2 py-1 rounded"
            type="text"
            placeholder="URL do stream..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={(e) => {
               if (e.key === "Enter") setUrl(search);
            }}
         />

         {/* Seek Bar (Progresso) */}
         <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs font-mono">
               <span>{SongController.formatTime(currentTime)}</span>
               <span>{SongController.formatTime(duration)}</span>
            </div>
            <input
               type="range"
               min="0"
               max={duration || 0}
               value={currentTime}
               className="w-full h-2 accent-amber-500 cursor-pointer"
               onChange={(e) => {
                  const targetTime = Number(e.target.value);
                  setCurrentTime(targetTime); // Feedback visual imediato (Optimistic UI)
                  songRef.current?.seek(targetTime);
               }}
            />
         </div>

         {/* Volume */}
         <div className="flex items-center gap-2">
            <span className="text-sm">Volume: {volume}%</span>
            <input
               type="range"
               min="0"
               max="100"
               value={volume}
               className="accent-white"
               onChange={(e) => setVolume(Number(e.target.value))}
            />
         </div>

         <button
            className="bg-zinc-700 py-1 rounded hover:bg-zinc-600 transition"
            onClick={() => songRef.current?.skip(10)}
         >
            Avançar +10s
         </button>

         <button
            disabled={isDownloading}
            onClick={handleDownload}
            className={`p-2 rounded ${isDownloading ? 'bg-gray-500' : 'bg-blue-600'}`}
         >
            {isDownloading ? "BAIXANDO..." : "BAIXAR PARA O PC"}
         </button>

         <SearchBar />
      </div>
   );
};

export const SearchBar = () => {
   const [input, setInput] = useState("");
   const [suggestions, setSuggestions] = useState<string[]>([]);
   const [showSuggestions, setShowSuggestions] = useState(false);

   useEffect(() => {
      const timer = setTimeout(async () => {
         if (input.trim().length > 1) {
            const res = await GetSearchSuggestions(input);
            setSuggestions(res);
            setShowSuggestions(true);
         } else {
            setSuggestions([]);
         }
      }, 300); // 300ms de espera

      return () => clearTimeout(timer);
   }, [input]);

   return (
      <div className="relative w-full max-w-xl">
         <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay para permitir o clique
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full bg-zinc-800 p-2 rounded border border-zinc-700 outline-none focus:border-emerald-500"
            placeholder="Pesquisar música..."
         />

         {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-50 w-full bg-zinc-800 border border-zinc-700 rounded-b mt-1 shadow-xl">
               {suggestions.map((s, i) => (
                  <li
                     key={i}
                     onClick={() => {
                        setInput(s);
                        setShowSuggestions(false);
                        // Chame sua função de busca real aqui: handleSearch(s)
                     }}
                     className="p-2 hover:bg-zinc-700 cursor-pointer text-sm border-b border-zinc-700/50 last:border-0"
                  >
                     🔍 {s}
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
};