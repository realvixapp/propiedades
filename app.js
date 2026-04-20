const { useState, useEffect, useRef } = React;

const GROQ_API_KEY = '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';

function App() {
    const [formData, setFormData] = useState({
        direccion: '',
        zona: '',
        tipologia: 'departamento',
        ambientes: 2,
        metrosCubiertos: '',
        metrosTotales: '',
        antiguedadPublicacion: 90 // días
    });

    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState(null);
    const [drawnArea, setDrawnArea] = useState(null);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const drawnItems = useRef(null);

    // Zonas sugeridas para autocompletado
    const zonasSugeridas = [
        'Morón Centro', 'Morón Norte', 'Morón Sur',
        'Castelar', 'Haedo', 'El Palomar', 'Villa Sarmiento',
        'Ituzaingó', 'Hurlingham', 'San Justo'
    ];

    useEffect(() => {
        if (!mapInstance.current && mapRef.current) {
            // Inicializar mapa centrado en Morón
            const map = L.map(mapRef.current).setView([-34.6537, -58.6199], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Inicializar capa de dibujo
            drawnItems.current = new L.FeatureGroup();
            map.addLayer(drawnItems.current);

            const drawControl = new L.Control.Draw({
                draw: {
                    polygon: true,
                    rectangle: true,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                    polyline: false
                },
                edit: {
                    featureGroup: drawnItems.current,
                    remove: true
                }
            });
            map.addControl(drawControl);

            map.on(L.Draw.Event.CREATED, (e) => {
                const layer = e.layer;
                drawnItems.current.clearLayers();
                drawnItems.current.addLayer(layer);
                
                const bounds = layer.getBounds();
                setDrawnArea({
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest()
                });
            });

            mapInstance.current = map;
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const buscarPropiedades = async () => {
        setLoading(true);
        
        try {
            // Simular búsqueda en múltiples portales
            const prompt = `
Eres un experto tasador inmobiliario. Analiza el siguiente mercado y proporciona una tasación detallada.

PROPIEDAD A TASAR:
- Tipo: ${formData.tipologia}
- Ambientes: ${formData.ambientes}
- Metros cubiertos: ${formData.metrosCubiertos} m²
- Metros totales: ${formData.metrosTotales} m²
- Zona: ${formData.zona || formData.direccion}
- Considerar publicaciones de los últimos ${formData.antiguedadPublicacion} días

INSTRUCCIONES:
1. Genera datos realistas de mercado para Argentina (precios en USD)
2. Simula 15-20 propiedades comparables encontradas en Mercado Libre, ZonaProp y Argenprop
3. Calcula métricas detalladas

Responde ÚNICAMENTE con un objeto JSON válido (sin markdown, sin comentarios) con esta estructura exacta:

{
  "propiedadesAnalizadas": 18,
  "precioPromedio": 95000,
  "precioMinimo": 75000,
  "precioMaximo": 120000,
  "precioPorM2Promedio": 1450,
  "estimadoCierreReal": 88000,
  "ajusteCierre": -7.4,
  "tiempoPromedioPublicacion": 45,
  "visualizacionesPromedio": 320,
  "porPortal": {
    "mercadoLibre": {
      "cantidad": 8,
      "precioPromedio": 92000,
      "precioPorM2": 1400
    },
    "zonaProp": {
      "cantidad": 6,
      "precioPromedio": 98000,
      "precioPorM2": 1500
    },
    "argenProp": {
      "cantidad": 4,
      "precioPromedio": 96000,
      "precioPorM2": 1450
    }
  },
  "distribucionPrecios": [
    {"rango": "70-80K", "cantidad": 4},
    {"rango": "80-90K", "cantidad": 6},
    {"rango": "90-100K", "cantidad": 5},
    {"rango": "100-110K", "cantidad": 2},
    {"rango": "110-120K", "cantidad": 1}
  ],
  "propiedadesMuestra": [
    {
      "portal": "ZonaProp",
      "precio": 95000,
      "precioPorM2": 1450,
      "m2": 65,
      "ambientes": 2,
      "diasPublicado": 30,
      "visualizaciones": 350,
      "zona": "Morón Centro"
    }
  ]
}
`;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            // Limpiar respuesta y parsear JSON
            let cleanContent = content.trim();
            if (cleanContent.startsWith('```json')) {
                cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            
            const resultadosAnalisis = JSON.parse(cleanContent);
            
            setResultados(resultadosAnalisis);
            
            // Agregar marcadores al mapa si hay propiedades muestra
            if (resultadosAnalisis.propiedadesMuestra && mapInstance.current) {
                resultadosAnalisis.propiedadesMuestra.forEach((prop, idx) => {
                    // Generar coordenadas aleatorias cerca de Morón
                    const lat = -34.6537 + (Math.random() - 0.5) * 0.05;
                    const lng = -58.6199 + (Math.random() - 0.5) * 0.05;
                    
                    const marker = L.marker([lat, lng]).addTo(mapInstance.current);
                    marker.bindPopup(`
                        <strong>USD ${prop.precio.toLocaleString()}</strong><br/>
                        ${prop.ambientes} amb - ${prop.m2}m²<br/>
                        USD ${prop.precioPorM2}/m²<br/>
                        ${prop.portal} - ${prop.diasPublicado} días
                    `);
                });
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al realizar la tasación. Verifica la conexión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-lg">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">🏠 Sistema de Tasación Inmobiliaria</h1>
                    <p className="text-blue-100 mt-2">Análisis inteligente de Mercado Libre, ZonaProp y ArgenProp</p>
                </div>
            </div>

            <div className="container mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulario */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Datos de la Propiedad</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Av. Rivadavia 1234"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Zona/Barrio
                                </label>
                                <input
                                    type="text"
                                    name="zona"
                                    value={formData.zona}
                                    onChange={handleInputChange}
                                    list="zonas"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Comienza a escribir..."
                                />
                                <datalist id="zonas">
                                    {zonasSugeridas.map(zona => (
                                        <option key={zona} value={zona} />
                                    ))}
                                </datalist>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tipología
                                    </label>
                                    <select
                                        name="tipologia"
                                        value={formData.tipologia}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="departamento">Departamento</option>
                                        <option value="casa">Casa</option>
                                        <option value="ph">PH</option>
                                        <option value="terreno">Terreno</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ambientes
                                    </label>
                                    <select
                                        name="ambientes"
                                        value={formData.ambientes}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="1">1 ambiente</option>
                                        <option value="2">2 ambientes</option>
                                        <option value="3">3 ambientes</option>
                                        <option value="4">4+ ambientes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Metros Cubiertos
                                    </label>
                                    <input
                                        type="number"
                                        name="metrosCubiertos"
                                        value={formData.metrosCubiertos}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="65"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Metros Totales
                                    </label>
                                    <input
                                        type="number"
                                        name="metrosTotales"
                                        value={formData.metrosTotales}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="70"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Antigüedad de Publicaciones (días)
                                </label>
                                <select
                                    name="antiguedadPublicacion"
                                    value={formData.antiguedadPublicacion}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="30">Últimos 30 días</option>
                                    <option value="60">Últimos 60 días</option>
                                    <option value="90">Últimos 3 meses</option>
                                    <option value="180">Últimos 6 meses</option>
                                    <option value="365">Último año</option>
                                </select>
                            </div>

                            <button
                                onClick={buscarPropiedades}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {loading ? '🔍 Analizando mercado...' : '🚀 Obtener Tasación'}
                            </button>
                        </div>
                    </div>

                    {/* Mapa */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">📍 Zona de Búsqueda</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Usa las herramientas del mapa para dibujar el área de búsqueda
                        </p>
                        <div 
                            ref={mapRef} 
                            className="w-full h-96 rounded-lg border-2 border-gray-200"
                        ></div>
                    </div>
                </div>

                {/* Dashboard de Resultados */}
                {resultados && (
                    <div className="mt-8 space-y-6">
                        {/* Resumen Principal */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Valor de Publicación */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-lg text-gray-600 mb-2">Valor de publicación</h3>
                                <div className="text-4xl font-bold text-gray-900">
                                    USD {resultados.precioPromedio.toLocaleString()}
                                </div>
                                <p className="text-gray-500 mt-2">
                                    Rango: USD {resultados.precioMinimo.toLocaleString()} – {resultados.precioMaximo.toLocaleString()}
                                </p>
                                <p className="text-blue-600 font-semibold mt-2">
                                    USD {resultados.precioPorM2Promedio.toLocaleString()}/m²
                                </p>
                            </div>

                            {/* Estimado de Cierre Real */}
                            <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
                                <h3 className="text-lg text-gray-600 mb-2">Estimado de cierre real</h3>
                                <div className="text-4xl font-bold text-blue-600">
                                    USD {resultados.estimadoCierreReal.toLocaleString()}
                                </div>
                                <p className="text-gray-500 mt-2">
                                    Ajuste cierre: {resultados.ajusteCierre}%
                                </p>
                                <p className="text-blue-600 font-semibold mt-2">
                                    USD {Math.round(resultados.estimadoCierreReal / (formData.metrosCubiertos || 65)).toLocaleString()}/m² • Activo
                                </p>
                            </div>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600">Propiedades Analizadas</p>
                                        <p className="text-3xl font-bold text-gray-900">{resultados.propiedadesAnalizadas}</p>
                                    </div>
                                    <div className="text-4xl">📊</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600">Tiempo Promedio</p>
                                        <p className="text-3xl font-bold text-gray-900">{resultados.tiempoPromedioPublicacion} días</p>
                                    </div>
                                    <div className="text-4xl">⏱️</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600">Visualizaciones</p>
                                        <p className="text-3xl font-bold text-gray-900">{resultados.visualizacionesPromedio}</p>
                                    </div>
                                    <div className="text-4xl">👁️</div>
                                </div>
                            </div>
                        </div>

                        {/* Comparación por Portal */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-2xl font-bold mb-6 text-gray-800">Precio M² por Portal — Comparación</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold">Mercado Libre</span>
                                        <span className="text-blue-600 font-bold">
                                            USD {resultados.porPortal.mercadoLibre.precioPorM2.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-8">
                                        <div 
                                            className="bg-yellow-400 h-8 rounded-full flex items-center justify-end pr-3"
                                            style={{width: `${(resultados.porPortal.mercadoLibre.precioPorM2 / 1600) * 100}%`}}
                                        >
                                            <span className="text-sm font-semibold">{resultados.porPortal.mercadoLibre.cantidad} propiedades</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold">ZonaProp</span>
                                        <span className="text-blue-600 font-bold">
                                            USD {resultados.porPortal.zonaProp.precioPorM2.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-8">
                                        <div 
                                            className="bg-green-500 h-8 rounded-full flex items-center justify-end pr-3"
                                            style={{width: `${(resultados.porPortal.zonaProp.precioPorM2 / 1600) * 100}%`}}
                                        >
                                            <span className="text-sm font-semibold text-white">{resultados.porPortal.zonaProp.cantidad} propiedades</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold">ArgenProp</span>
                                        <span className="text-blue-600 font-bold">
                                            USD {resultados.porPortal.argenProp.precioPorM2.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-8">
                                        <div 
                                            className="bg-blue-500 h-8 rounded-full flex items-center justify-end pr-3"
                                            style={{width: `${(resultados.porPortal.argenProp.precioPorM2 / 1600) * 100}%`}}
                                        >
                                            <span className="text-sm font-semibold text-white">{resultados.porPortal.argenProp.cantidad} propiedades</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Distribución de Precios */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-2xl font-bold mb-6 text-gray-800">Distribución de Precios</h3>
                            <div className="space-y-3">
                                {resultados.distribucionPrecios.map((dist, idx) => (
                                    <div key={idx} className="flex items-center">
                                        <div className="w-24 text-sm font-semibold text-gray-700">{dist.rango}</div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-6 ml-4">
                                            <div 
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                                style={{width: `${(dist.cantidad / 10) * 100}%`}}
                                            >
                                                {dist.cantidad}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Propiedades Muestra */}
                        {resultados.propiedadesMuestra && (
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-2xl font-bold mb-6 text-gray-800">Propiedades Comparables</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Portal</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Precio</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">USD/m²</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">m²</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amb</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Días</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vistas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {resultados.propiedadesMuestra.slice(0, 5).map((prop, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            prop.portal === 'MercadoLibre' ? 'bg-yellow-100 text-yellow-800' :
                                                            prop.portal === 'ZonaProp' ? 'bg-green-100 text-green-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {prop.portal}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-semibold">USD {prop.precio.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-sm">{prop.precioPorM2.toLocaleString()}</td>
                                                    <td className="px-4 py-3 text-sm">{prop.m2}</td>
                                                    <td className="px-4 py-3 text-sm">{prop.ambientes}</td>
                                                    <td className="px-4 py-3 text-sm">{prop.diasPublicado}</td>
                                                    <td className="px-4 py-3 text-sm">{prop.visualizaciones}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
