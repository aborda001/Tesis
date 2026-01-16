"""
Script de prueba para verificar que el servicio de emociones funciona
"""
import requests
import io

print("Probando conexión al servicio de análisis de emociones...")
print("-" * 60)

# 1. Probar endpoint de salud
try:
    response = requests.get("http://localhost:5000/health")
    if response.status_code == 200:
        print("✓ Servicio Python está corriendo")
        print(f"  Respuesta: {response.json()}")
    else:
        print(f"✗ Error en health check: {response.status_code}")
except Exception as e:
    print(f"✗ No se puede conectar al servicio Python: {e}")
    print("  Asegúrate de que emotion_service.py está corriendo")
    exit(1)

print()

# 2. Probar endpoint de backend Node.js
try:
    response = requests.get("http://localhost:3100/")
    if response.status_code == 200:
        print("✓ Backend Node.js está corriendo")
        print(f"  Respuesta: {response.text}")
    else:
        print(f"✗ Error en backend: {response.status_code}")
except Exception as e:
    print(f"✗ No se puede conectar al backend Node.js: {e}")
    print("  Asegúrate de que npm start está corriendo")

print()
print("-" * 60)
print("Diagnóstico completo")
print()
print("Para probar con audio real:")
print("1. Reinicia emotion_service.py si hiciste cambios")
print("2. Reinicia el servidor Node.js (npm start)")
print("3. Abre el frontend y prueba la grabación")
