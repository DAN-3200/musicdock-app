import './tailwind.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MusicGadget } from './view/MusicGadget';
import { PageTestView } from '../tests/PageTestView';

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      {/* <MusicGadget/> */}
      <PageTestView />
   </StrictMode>,
)