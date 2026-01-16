# 🎯 Sistema de Puntuación de Emociones - Explicación

## 📊 Nuevo Sistema de Evaluación (Más Estricto)

### Rangos de Puntuación

- **80-100%**: 🟢 Excelente - La emoción fue expresada muy bien
- **60-79%**: 🟡 Bien - Buena aproximación, pero puede mejorar
- **40-59%**: 🟠 Regular - Necesita más expresividad
- **0-39%**: 🔴 Bajo - No se detectó la emoción claramente

## 🎭 Criterios de Evaluación por Emoción

### 😊 FELIZ (Happy)

**Características esperadas:**
- ✅ **Pitch alto**: >240 Hz (voz más aguda)
- ✅ **Mucha variación**: >40 Hz de desviación estándar (entusiasmo)
- ✅ **Energía alta**: >0.15 (hablar fuerte)
- ✅ **Tempo rápido**: >140 BPM (hablar rápido)
- ✅ **Sonido brillante**: >2200 Hz (timbre claro)

**Puntaje base**: 30 puntos (solo por intentarlo)
**Máximo adicional**: 70 puntos por cumplir criterios

**Tips para obtener mejor puntaje:**
1. Habla más fuerte de lo normal
2. Sube el tono de tu voz
3. Habla más rápido
4. Varía mucho el tono (sube y baja)
5. Muestra entusiasmo real

---

### 😢 TRISTE (Sad)

**Características esperadas:**
- ✅ **Pitch bajo**: <140 Hz (voz más grave)
- ✅ **Poca variación**: <12 Hz de desviación (monotonía)
- ✅ **Energía baja**: <0.05 (hablar suave)
- ✅ **Tempo lento**: <70 BPM (hablar despacio)
- ✅ **Sonido apagado**: <1300 Hz (timbre opaco)

**Puntaje base**: 30 puntos
**Máximo adicional**: 70 puntos

**Tips:**
1. Habla muy suavemente (casi susurrando)
2. Baja el tono de tu voz
3. Habla despacio
4. Mantén el mismo tono (monotonía)
5. Sin energía ni emoción

---

### 😠 ENOJADO (Angry)

**Características esperadas:**
- ✅ **Pitch muy alto**: >250 Hz (tensión vocal)
- ✅ **Mucha variación**: >50 Hz (intensidad emocional)
- ✅ **Energía muy alta**: >0.18 (gritar/enfatizar)
- ✅ **Tempo rápido**: >150 BPM (hablar rápido)
- ✅ **Aspereza vocal**: >0.09 ZCR (voz áspera)

**Puntaje base**: 30 puntos
**Máximo adicional**: 70 puntos

**Tips:**
1. Habla MUY fuerte
2. Sube mucho el tono
3. Habla muy rápido
4. Varía extremadamente el tono
5. Muestra verdadera intensidad

---

## 🔧 Cambios Técnicos Realizados

### 1. Sistema de Penalizaciones
- Ahora se restan puntos si las características NO coinciden con la emoción
- Ejemplo: Si hablas suave en "feliz", se restan 8 puntos

### 2. Umbrales Más Estrictos
- **Antes**: Energía >0.05 = 10 puntos para "feliz"
- **Ahora**: Energía >0.15 = 20 puntos, <0.07 = -8 puntos

### 3. Puntaje Base Reducido
- **Antes**: Mínimo garantizado 40%
- **Ahora**: Puede bajar a 0% si no hay expresión

### 4. Más Características Evaluadas
- Desviación estándar del pitch (variación)
- Zero Crossing Rate (aspereza vocal)
- Spectral Centroid (brillo del sonido)

---

## 📈 Ejemplos de Resultados

### Ejemplo 1: Feliz - 85%
```
✅ Pitch: 245 Hz (muy bueno)
✅ Variación: 42 Hz (excelente)
✅ Energía: 0.16 (perfecta)
✅ Tempo: 145 BPM (muy bueno)
→ Resultado: ¡Excelente! Capturaste muy bien la emoción
```

### Ejemplo 2: Feliz - 55%
```
⚠️ Pitch: 180 Hz (aceptable)
⚠️ Variación: 18 Hz (poca expresividad)
❌ Energía: 0.06 (muy baja)
⚠️ Tempo: 100 BPM (lento)
→ Resultado: Intenta expresar más la emoción con tu voz
```

### Ejemplo 3: Feliz - 25%
```
❌ Pitch: 150 Hz (muy bajo)
❌ Variación: 8 Hz (monótono)
❌ Energía: 0.04 (susurro)
❌ Tempo: 70 BPM (muy lento)
→ Resultado: Necesitas más expresividad. ¡Inténtalo de nuevo!
```

---

## 🎤 Recomendaciones Generales

1. **Practica primero**: Prueba decir la frase varias veces antes de grabar
2. **Exagera**: Es mejor exagerar la emoción que quedarse corto
3. **Sé consistente**: Mantén la emoción durante toda la grabación
4. **Escucha el ejemplo**: Los ejemplos dados son buenos modelos
5. **Intenta de nuevo**: Si obtienes bajo puntaje, analiza qué faltó y vuelve a intentar

---

## 🐛 Debugging - Ver los Valores

En los logs de Python (consola donde corre `emotion_service.py`) verás:

```
INFO:__main__:Analizando emoción: happy
INFO:__main__:Pitch promedio: 210.45 Hz
INFO:__main__:Energía promedio: 0.0823
INFO:__main__:Tempo: 125.50 BPM
INFO:__main__:Desviación pitch: 25.32 Hz
INFO:__main__:Score calculado: 67
```

Usa estos valores para entender qué necesitas mejorar.
