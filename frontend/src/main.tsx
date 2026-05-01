import './tailwind.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PageTestView } from './tests/PageTestView';

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <PageTestView />
   </StrictMode>,
)