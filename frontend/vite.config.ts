import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Aseguramos que la raíz sea la carpeta frontend
  root: '.',

  server: {
    port: 5173,
    // LA MAGIA: Vite abrirá el navegador directamente en el Login
    open: '/src/pages/auth/login/login.html', 
    fs: {
      strict: false,
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  build: {
    rollupOptions: {
      input: {
        // Mapeamos todas las rutas para evitar errores 404
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'src/pages/auth/login/login.html'),
        storeHome: resolve(__dirname, 'src/pages/store/home/home.html'),
        adminHome: resolve(__dirname, 'src/pages/admin/adminHome/adminHome.html'),
        registro: resolve(__dirname, 'src/pages/auth/registro/registro.html'),
        orders: resolve(__dirname, 'src/pages/client/orders/orders.html'),
        productos: resolve(__dirname, 'src/pages/admin/products/productos.html'),
        pedidos: resolve(__dirname, 'src/pages/admin/orders/pedidos.html'),
        categorias: resolve(__dirname, 'src/pages/admin/adminHome/categorias/categorias.html')
      },
    },
  },
});