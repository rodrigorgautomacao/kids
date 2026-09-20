import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base '/kids/' -> o app roda no GitHub Pages em https://<usuário>.github.io/kids/
// Os assets (JS/CSS) são prefixados corretamente no subdomínio do repositório.
export default defineConfig({
  plugins: [react()],
  base: '/kids/',
});