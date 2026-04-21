import { useEffect, useRef, useState } from "react";
import { createSongController, SongController } from "../src/infra/musicApi";
import { NativeCommands } from "../src/infra/commands.native";

export const PageTestView = () => {
   const [volume, setVolume] = useState(50);
   const songRef = useRef<SongController | null>(null);
   const [search, setSearch] = useState('')
   const [url, setUrl] = useState('')

   useEffect(() => {
      (async () => {
         const conn = await NativeCommands.StartStreamServer()
         songRef.current = new SongController(conn);
      })();
   }, [url]);

   useEffect(() => {
      if (songRef.current) {
         songRef.current.SetVolume(volume);
      }
   }, [volume]);

   return (
      <div className="p-4 text-white space-x-2">
         <input type="text" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter") {
               setUrl(search)
            }
         }} />
         <button onClick={() => songRef.current?.Play()}>PLAY</button>
         <button onClick={() => songRef.current?.Pause()}>PAUSE</button>

         <input
            type="number"
            max={100}
            min={0}
            value={volume}
            onChange={(e) => setVolume(e.target.valueAsNumber)}
         />
      </div>
   );
};