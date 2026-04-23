import { useEffect, useRef, useState } from "react";
import { SongController } from "../src/infra/musicApi";
import { NativeCommands } from "../src/infra/commands.native";
import { WindowHide, WindowMinimise } from "../wailsjs/runtime"

export const PageTestView = () => {
   const [volume, setVolume] = useState(25);
   const songRef = useRef<SongController | null>(null);
   const [search, setSearch] = useState('')
   const [url, setUrl] = useState('')

   useEffect(() => {
      console.log(url)
      const ad = new SongController(`http://localhost:8080/stream?url=${url}`)
      ad.SetVolume(volume)
      songRef.current = ad
   }, [url])

   useEffect(() => {
      songRef.current?.SetVolume(volume)
   }, [volume])

   console.log(songRef.current?.Duration())
   return (
      <div className="p-4 text-white gap-2 flex flex-col">

         <button onClick={() => songRef.current?.Play()}>PLAY</button>
         <button onClick={() => songRef.current?.Pause()}>PAUSE</button>
         <button onClick={() => WindowMinimise()}>EXIT</button>

         <input className="ring-2 ring-white px-2" type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter") {
               setUrl(search)
            }
         }} />

         <input
            className="ring-2 ring-white px-2 w-15"
            type="number"
            min={1}
            max={99}
            value={volume}
            onChange={(e) => {
               const v = e.target.value;

               // permite digitação (inclusive apagar)
               if (v === "") {
                  setVolume(1);
                  return;
               }

               const num = Number(v);

               if (!Number.isNaN(num)) {
                  setVolume(num);
               }
            }}
         />
         <button
            onClick={() => songRef.current?.SkipForward(80)}
         >
            +10s
         </button>
         <span className="font-bold text-2xl text-white">{songRef.current?.Duration()}</span>
      </div>
   );
};