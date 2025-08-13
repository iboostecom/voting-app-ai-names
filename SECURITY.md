# 🔒 GUÍA DE SEGURIDAD

## ⚠️ IMPORTANTE: Credenciales Comprometidas

**Las credenciales originales de Firebase fueron expuestas públicamente en GitHub.** 

### 🚨 Pasos Completados de Remediación:

✅ **Reglas de Firebase mejoradas** (`firebase-rules.json`)
✅ **Validaciones de entrada implementadas** (`src/utils/security.ts`)
✅ **Rate limiting del lado cliente**
✅ **Sanitización de inputs**

### 🔑 Pasos Pendientes (URGENTES):

1. **Regenerar credenciales en Firebase Console**
2. **Actualizar archivo `.env` local**
3. **Aplicar nuevas reglas en Firebase Console**

## 🛡️ Configuración de Seguridad

### Firebase Rules (Aplicar en Firebase Console)

Las nuevas reglas incluyen:
- **Validación de longitud** para todos los campos
- **Validación de tipos** de datos
- **Límites de caracteres** para prevenir spam
- **Validación de timestamps** para prevenir manipulación
- **Restricciones en tipos** de notificaciones

### Validaciones del Cliente

- **Sanitización de inputs** para prevenir XSS
- **Rate limiting** para prevenir spam
- **Validación de nombres** con caracteres permitidos
- **Límites de longitud** en todos los campos

## 🔧 Proceso de Regeneración de Credenciales

### 1. Firebase Console:
```
1. Ve a https://console.firebase.google.com/
2. Selecciona proyecto "voting-app-ai-names"
3. Project Settings → General → Your Apps
4. Regenera o crea nueva Web App
5. Copia las nuevas credenciales
```

### 2. Archivo .env local:
```bash
cd voting-app
# Actualiza tu .env con las nuevas credenciales:
VITE_FIREBASE_API_KEY=NUEVA_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=voting-app-ai-names.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://voting-app-ai-names-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=voting-app-ai-names
VITE_FIREBASE_STORAGE_BUCKET=voting-app-ai-names.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=NUEVO_SENDER_ID
VITE_FIREBASE_APP_ID=NUEVO_APP_ID
```

### 3. Aplicar nuevas reglas Firebase:
```
1. En Firebase Console → Realtime Database → Rules
2. Copia el contenido de firebase-rules.json
3. Publica las reglas
```

## 🚀 Verificación Post-Regeneración

```bash
cd voting-app
npm run dev
```

Verifica que:
- ✅ La aplicación carga correctamente
- ✅ Los votos se guardan en Firebase
- ✅ Las validaciones funcionan
- ✅ No hay errores en consola

## 📋 Mejores Prácticas de Seguridad

### ✅ DO:
- Usar variables de entorno para credenciales
- Validar todos los inputs del usuario
- Implementar rate limiting
- Revisar regularmente las reglas de Firebase
- Monitorear logs de uso anómalo

### ❌ DON'T:
- Nunca commitear archivos .env
- No hardcodear credenciales en el código
- No confiar en validaciones solo del cliente
- No permitir acceso sin límites a la base de datos

## 🔍 Herramientas de Monitoreo

- **Firebase Console**: Monitoreo de uso y errores
- **Browser DevTools**: Verificar requests de red
- **Git hooks**: Para prevenir commits de credenciales

## 📞 En Caso de Emergencia

Si sospechas otra exposición de credenciales:

1. **Inmediatamente** regenera todas las credenciales
2. Revisa logs de Firebase por actividad anómala
3. Considera implementar autenticación
4. Evalúa migrar a un nuevo proyecto Firebase si es necesario