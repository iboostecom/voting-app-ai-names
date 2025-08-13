# App de Votación para Nombres de Servicio de Agentes Inteligentes

**Aplicación colaborativa en tiempo real** para votar nombres de servicios de inteligencia artificial organizados por categorías culturales y temáticas.

## ✨ Características v2.0.0 - ¡TIEMPO REAL!

### 🔥 Nuevas Funcionalidades Colaborativas
- **⚡ Sincronización en tiempo real**: Ve votos de otros usuarios al instante
- **👥 Usuarios activos**: Contador en vivo de quién está votando
- **🔔 Notificaciones instantáneas**: Actividad de votación en tiempo real  
- **🎊 Efectos divertidos**: Confetti animado al votar
- **❤️ Respuesta instantánea**: Los corazones se activan inmediatamente
- **📊 Comparación social**: Panel de votos por persona en tiempo real
- **🏆 Popularidad dinámica**: Badges que muestran consenso y favoritos

### 💫 Experiencia Mejorada
- **🎬 Animaciones suaves**: Transiciones fluidas con Framer Motion
- **📈 Estadísticas en vivo**: Popularidad y porcentajes actualizados
- **🎮 Interfaz gamificada**: Efectos visuales y retroalimentación inmediata
- **👀 Transparencia total**: Ve cómo votan otros en tiempo real

### 🏗️ Funcionalidades Base
- **Votación por categorías**: 7 categorías temáticas diferentes
- **Nombres personalizados**: Los usuarios pueden agregar sus propias sugerencias
- **Interfaz responsive**: Optimizada para desktop y móvil con Tailwind CSS
- **Resumen de favoritos**: Lista de nombres seleccionados con funcionalidad copy-to-clipboard

## 📁 Estructura del Proyecto

- `voting-app/src/FirebaseVotingApp.tsx` - **Componente principal v2.0.0** (tiempo real)
- `voting-app/src/firebase.ts` - Configuración de Firebase  
- `naming-voting-app.tsx` - Componente standalone (versión v1.0.0)
- `firebase-rules.json` - Reglas de seguridad para Firebase
- `voting-app/` - Aplicación completa con configuración de Vite
- `CLAUDE.md` - Documentación técnica del proyecto

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd voting-app
npm install
```

### 2. Configurar Firebase (Para v2.0.0)

⚠️ **IMPORTANTE**: Lee `SECURITY.md` antes de configurar Firebase.

1. **Crear proyecto Firebase:**
   - Ve a https://console.firebase.google.com/
   - Crea un nuevo proyecto
   - Habilita Realtime Database

2. **Configurar variables de entorno:**
   - Copia `voting-app/.env.example` a `voting-app/.env`
   - Obtén tus credenciales desde Firebase Console → Project Settings → Your Apps
   - **NUNCA** commitees el archivo `.env`

3. **Configurar reglas de seguridad:**
   - En Firebase Console → Realtime Database → Reglas  
   - Copia el contenido de `firebase-rules.json` (incluye validaciones mejoradas)

### 3. Ejecutar la Aplicación

```bash
npm run dev
```

### Versiones Disponibles

- **v2.0.0** (Actual): `FirebaseVotingApp.tsx` - Colaborativa en tiempo real
- **v1.0.0** (Legacy): `naming-voting-app.tsx` - Standalone local

## 📋 Categorías Incluidas

1. **Cultura Hispana/Latina**
2. **Enfoque en Velocidad**
3. **Modular/Adaptable**
4. **Tecnología Regional LATAM**
5. **IA Futurista**
6. **Valores en Español**
7. **Valores en Inglés**

## 🔒 Seguridad y Privacidad

⚠️ **ATENCIÓN**: Las credenciales originales fueron comprometidas. Consulta `SECURITY.md` para remediation completa.

### v2.0.0 (Firebase) - Seguridad Mejorada
- **Firebase Realtime Database**: Base de datos en tiempo real
- **Reglas de validación mejoradas**: Límites de longitud, tipos de datos, rate limiting
- **Sanitización de inputs**: Prevención de XSS y ataques de inyección
- **Rate limiting del cliente**: Protección contra spam
- **Variables de entorno**: Credenciales protegidas localmente
- **Sin autenticación**: Acceso abierto pero validado

### v1.0.0 (Local)
- **Sin APIs externas**: Todo funciona localmente
- **Sin persistencia**: Los datos se pierden al cerrar el navegador
- **Completamente privado**: Nada sale de tu dispositivo

### Consideraciones de Seguridad Actualizadas
- **Reglas estrictas de Firebase** con validación de datos
- **Monitoreo requerido** para detectar uso anómalo
- **Credenciales en variables de entorno** únicamente
- **Validaciones tanto cliente como servidor**
- Para producción crítica, implementa autenticación completa

### Archivos de Seguridad
- `SECURITY.md` - Guía completa de seguridad y remediation
- `firebase-rules.json` - Reglas de Firebase con validaciones
- `src/utils/security.ts` - Utilidades de validación y sanitización

## 🤝 Contribuciones

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 🏷️ Historial de Versiones

### v2.0.0 - Votación Colaborativa en Tiempo Real (Actual)
- ✨ Sincronización en tiempo real con Firebase
- 🎊 Efectos de confetti y animaciones
- 👥 Contador de usuarios activos
- 📊 Panel de comparación entre votantes
- ❤️ Respuesta instantánea de votos
- 🔔 Notificaciones de actividad en vivo

### v1.0.0 - Versión Inicial 
- 🗳️ Votación básica por categorías
- 💡 Agregar nombres personalizados  
- 📋 Resumen de favoritos
- 📱 Interfaz responsive
- 🏠 Funcionamiento completamente local

## 🚀 Roadmap Futuro

- 🔐 Sistema de autenticación opcional
- 📈 Dashboard de analytics
- 🎨 Temas personalizables
- 📱 Aplicación móvil PWA
- 🌍 Soporte multi-idioma
- 💾 Exportar resultados a CSV/JSON

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.