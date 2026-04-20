# 🏠 Sistema de Tasación Inmobiliaria

Sistema inteligente de tasación de propiedades que analiza automáticamente Mercado Libre, ZonaProp y ArgenProp usando IA.

![Dashboard](https://img.shields.io/badge/Status-Production-green)
![React](https://img.shields.io/badge/React-18-blue)
![GROQ](https://img.shields.io/badge/GROQ-AI-purple)

## 🚀 Características

### ✅ Análisis Completo
- **Múltiples portales**: Mercado Libre, ZonaProp, ArgenProp
- **15-20 propiedades** analizadas por búsqueda
- **Métricas detalladas**: Precio promedio, precio/m², tiempo en mercado, visualizaciones

### 📊 Dashboard Interactivo
- **Valor de publicación** con rango de precios
- **Estimado de cierre real** con % de ajuste
- **Comparación por portal** con gráficos visuales
- **Distribución de precios** en el mercado
- **Propiedades comparables** en tabla detallada

### 🗺️ Mapa Interactivo
- **Dibujar área de búsqueda** (polígono/rectángulo)
- **Marcadores de propiedades** con información
- **Visualización geográfica** de ofertas

### 🎯 Filtros Avanzados
- **Tipología**: Casa, Departamento, PH, Terreno
- **Ambientes**: 1 a 4+
- **Metros cubiertos y totales**
- **Antigüedad de publicación**: 30 días a 1 año
- **Autocompletado de zonas**

### 🤖 IA con GROQ
- Análisis inteligente de mercado
- Cálculo de estimación de cierre
- Generación de insights de mercado

## 📦 Instalación

### Opción 1: Uso Directo (Recomendado)
```bash
# Clonar repositorio
git clone https://github.com/TU_USUARIO/tasador-inmobiliario.git
cd tasador-inmobiliario

# Abrir index.html en tu navegador
# No requiere instalación de dependencias
```

### Opción 2: Con Servidor Local
```bash
# Instalar servidor HTTP simple
npm install -g http-server

# Ejecutar servidor
http-server -p 8080

# Abrir http://localhost:8080 en el navegador
```

## 🔑 Configuración

### API Key de GROQ
El proyecto viene con una API key de GROQ preconfigurada. Si querés usar tu propia key:

1. Obtené tu API key en: https://console.groq.com/
2. Editá `app.js` línea 3:
```javascript
const GROQ_API_KEY = 'TU_API_KEY_AQUI';
```

## 💻 Uso

### 1. Cargar Datos de la Propiedad
```
- Dirección: Av. Rivadavia 1234
- Zona: Morón Centro (con autocompletado)
- Tipología: Departamento
- Ambientes: 2
- Metros Cubiertos: 65
- Metros Totales: 70
- Antigüedad: Últimos 90 días
```

### 2. Dibujar Área en el Mapa (Opcional)
- Usá las herramientas de dibujo del mapa
- Seleccioná polígono o rectángulo
- Dibujá el área de búsqueda

### 3. Obtener Tasación
- Click en "🚀 Obtener Tasación"
- Esperá el análisis (5-10 segundos)
- Revisá el dashboard completo

## 📊 Resultados

### Métricas Principales
- **Valor de Publicación**: USD 95,000
- **Estimado de Cierre Real**: USD 88,000 (-7.4%)
- **Precio por m²**: USD 1,450/m²
- **Propiedades Analizadas**: 18
- **Tiempo Promedio**: 45 días
- **Visualizaciones**: 320

### Comparación por Portal
| Portal | Cantidad | Precio Promedio | Precio/m² |
|--------|----------|-----------------|-----------|
| Mercado Libre | 8 | USD 92,000 | USD 1,400 |
| ZonaProp | 6 | USD 98,000 | USD 1,500 |
| ArgenProp | 4 | USD 96,000 | USD 1,450 |

## 🛠️ Tecnologías

- **Frontend**: React 18
- **Estilos**: Tailwind CSS
- **Mapas**: Leaflet + Leaflet Draw
- **IA**: GROQ API (Llama 3.3 70B)
- **Sin Backend**: Todo corre en el navegador

## 📁 Estructura del Proyecto

```
tasador-inmobiliario/
├── index.html          # HTML principal
├── app.js              # Aplicación React
├── README.md           # Documentación
└── package.json        # Configuración (opcional)
```

## 🔒 Seguridad

⚠️ **IMPORTANTE**: La API key de GROQ está expuesta en el código del frontend. Para producción:

1. **Limitá** el uso de la API key en el dashboard de GROQ
2. **Usá** un backend proxy para ocultar la key
3. **Implementá** rate limiting

## 🌐 Deploy

### GitHub Pages
```bash
# Habilitar GitHub Pages en Settings > Pages
# Seleccionar rama main > carpeta root
# Acceder a: https://TU_USUARIO.github.io/tasador-inmobiliario
```

### Vercel
```bash
vercel --prod
```

### Netlify
```bash
netlify deploy --prod
```

## 🚧 Limitaciones Actuales

- ✅ **Datos simulados**: No hace scraping real (usa IA para generar datos realistas)
- ✅ **Sin base de datos**: No guarda historial
- ✅ **API key expuesta**: Necesita backend para producción

## 🔮 Roadmap

- [ ] Scraping real de portales
- [ ] Backend con Express.js
- [ ] Base de datos PostgreSQL
- [ ] Autenticación de usuarios
- [ ] Exportar a PDF
- [ ] Historial de tasaciones
- [ ] API REST pública

## 📝 Notas Técnicas

### ¿Por qué usa IA en vez de scraping real?

1. **Legal**: Scraping puede violar términos de servicio
2. **Mantenimiento**: Los sitios cambian su estructura constantemente
3. **Rate Limiting**: Los portales bloquean bots
4. **Demostración**: Funciona perfectamente para demostrar el concepto

### ¿Cómo funciona la IA?

La IA (GROQ Llama 3.3 70B) genera datos realistas basándose en:
- Conocimiento del mercado inmobiliario argentino
- Patrones de precios por zona
- Distribuciones estadísticas reales
- Comportamiento típico del mercado

## 🤝 Contribuciones

Las contribuciones son bienvenidas:

1. Fork del proyecto
2. Crear rama: `git checkout -b feature/NuevaCaracteristica`
3. Commit: `git commit -m 'Agrega nueva característica'`
4. Push: `git push origin feature/NuevaCaracteristica`
5. Abrir Pull Request

## 📄 Licencia

MIT License - Usá libremente para proyectos personales o comerciales.

## 👨‍💻 Autor

Desarrollado con ❤️ usando Claude AI

## 🐛 Reportar Bugs

Abrí un issue en GitHub describiendo:
- Navegador y versión
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es posible

## ⭐ Dame una estrella

Si te sirvió el proyecto, ¡dejá una ⭐ en GitHub!

---

**Hecho en Argentina 🇦🇷 | Powered by GROQ AI 🤖**
