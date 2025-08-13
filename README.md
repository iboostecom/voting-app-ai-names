# App de Votación para Nombres de Servicio de Agentes Inteligentes

Aplicación React para votar en nombres de servicios de inteligencia artificial organizados por categorías culturales y temáticas.

## 🚀 Características

- **Votación por categorías**: 7 categorías temáticas diferentes
- **Nombres personalizados**: Los usuarios pueden agregar sus propias sugerencias
- **Interfaz responsive**: Optimizada para desktop y móvil con Tailwind CSS
- **Resumen de favoritos**: Lista de nombres seleccionados con funcionalidad copy-to-clipboard
- **Sistema multi-votante**: Soporte para múltiples usuarios votando en la misma sesión

## 📁 Estructura del Proyecto

- `naming-voting-app.tsx` - Componente React principal (versión standalone)
- `voting-app/` - Aplicación completa con configuración de Vite
- `CLAUDE.md` - Documentación técnica del proyecto

## 🛠️ Instalación y Uso

### Versión con Vite (Recomendada)

```bash
cd voting-app
npm install
npm run dev
```

### Versión Standalone

El archivo `naming-voting-app.tsx` puede ser integrado directamente en cualquier aplicación React existente.

## 📋 Categorías Incluidas

1. **Cultura Hispana/Latina**
2. **Enfoque en Velocidad**
3. **Modular/Adaptable**
4. **Tecnología Regional LATAM**
5. **IA Futurista**
6. **Valores en Español**
7. **Valores en Inglés**

## 🔒 Seguridad

Este proyecto no incluye:
- APIs externas
- Bases de datos
- Información sensible o credenciales
- Dependencias de seguridad críticas

Los datos de votación se almacenan solo en el estado local del navegador durante la sesión.

## 🤝 Contribuciones

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.