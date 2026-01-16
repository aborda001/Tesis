# 🎮 Scripts Disponibles

## 🚀 Scripts Principales

### 1. **start-services.bat**
**Inicia todo el sistema completo**

```bash
# Doble clic o ejecutar en cmd:
start-services.bat
```

**¿Qué hace?**
- ✅ Verifica Python, Node.js y ffmpeg
- ✅ Instala dependencias si hacen falta
- ✅ Crea archivos de configuración
- ✅ Inicia Servicio Python (puerto 5000)
- ✅ Inicia Backend Node.js (puerto 3100)
- ✅ Inicia Frontend Next.js (puerto 3000)
- ✅ Abre el navegador automáticamente

**Usa este script para iniciar el sistema completo con un solo clic!**

---

### 2. **stop-services.bat**
**Detiene todos los servicios**

```bash
stop-services.bat
```

**¿Qué hace?**
- ❌ Cierra el Servicio Python
- ❌ Cierra el Backend Node.js
- ❌ Cierra el Frontend Next.js

---

### 3. **check-status.bat**
**Verifica el estado del sistema**

```bash
check-status.bat
```

**¿Qué hace?**
- 🔍 Verifica si Python está corriendo (puerto 5000)
- 🔍 Verifica si Backend está corriendo (puerto 3100)
- 🔍 Verifica si Frontend está corriendo (puerto 3000)
- 🔍 Verifica instalación de Python, Node.js y ffmpeg
- 🔍 Prueba conexión a cada servicio

---

### 4. **install-dependencies.bat**
**Solo instala dependencias (sin iniciar)**

```bash
install-dependencies.bat
```

**¿Qué hace?**
- 📦 Instala dependencias Backend (npm install)
- 📦 Instala dependencias Python (pip install)
- 📦 Instala dependencias Frontend (npm install)
- ⚙️ Crea archivos de configuración
- 📁 Crea carpetas necesarias

**Usa este script la primera vez o cuando agregues nuevas dependencias**

---

## 📋 Flujo de Trabajo Recomendado

### Primera Vez:

1. **Instalar ffmpeg** (si no lo tienes):
   ```bash
   winget install ffmpeg
   ```

2. **Ejecutar start-services.bat**
   - El script instalará todo automáticamente

### Uso Diario:

1. **Iniciar**: `start-services.bat`
2. **Trabajar** en http://localhost:3000
3. **Detener**: `stop-services.bat` o cerrar las ventanas

### Solución de Problemas:

1. **Verificar estado**: `check-status.bat`
2. **Reinstalar dependencias**: `install-dependencies.bat`
3. **Reiniciar todo**: `stop-services.bat` luego `start-services.bat`

---

## 🎯 Casos de Uso

### "Quiero iniciar el sistema"
```bash
start-services.bat
```

### "El sistema no funciona correctamente"
```bash
check-status.bat
```

### "Agregué nuevas dependencias"
```bash
install-dependencies.bat
```

### "Quiero cerrar todo"
```bash
stop-services.bat
```

### "¿Qué servicios están corriendo?"
```bash
check-status.bat
```

---

## 💡 Tips

- **Siempre usa `start-services.bat`** para iniciar - es el más completo
- **No cierres las ventanas de consola** manualmente mientras trabajas
- **Usa `check-status.bat`** si algo no funciona
- **Usa `stop-services.bat`** antes de reiniciar tu computadora
- **Si instalas ffmpeg**, reinicia las terminales después

---

## 🐛 Errores Comunes

| Error | Solución |
|-------|----------|
| "Port already in use" | Ejecuta `stop-services.bat` |
| "Python not found" | Instala Python 3.8+ |
| "Node.js not found" | Instala Node.js 14+ |
| "ffmpeg not found" | `winget install ffmpeg` |
| Análisis no funciona | Verifica que ffmpeg esté instalado |
| Dependencias faltantes | Ejecuta `install-dependencies.bat` |

---

## ✅ Checklist de Verificación

- [ ] Python 3.8+ instalado
- [ ] Node.js 14+ instalado
- [ ] ffmpeg instalado
- [ ] Ejecutado `start-services.bat`
- [ ] 3 ventanas de consola abiertas
- [ ] Navegador abrió en http://localhost:3000
- [ ] Todo funciona correctamente

---

## 📞 Ayuda Rápida

**El sistema no inicia:**
1. Ejecuta `check-status.bat`
2. Verifica que Python, Node.js y ffmpeg estén instalados
3. Ejecuta `install-dependencies.bat`
4. Intenta `start-services.bat` de nuevo

**El análisis de audio no funciona:**
1. Verifica ffmpeg: `ffmpeg -version`
2. Si no está: `winget install ffmpeg`
3. Reinicia las consolas de Python
4. Intenta de nuevo

**Necesito reiniciar todo:**
1. `stop-services.bat`
2. Espera 5 segundos
3. `start-services.bat`
