import './tailwind.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MusicGadgetView } from './view/MusicGadgetView';


createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <MusicGadgetView />
   </StrictMode>,
)