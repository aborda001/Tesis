from flask import Flask, request, jsonify
from flask_cors import CORS
import librosa
import numpy as np
import os
import tempfile
import logging
import subprocess
import time
from pydub import AudioSegment

app = Flask(__name__)
CORS(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def safe_remove_file(filepath, max_attempts=5, delay=0.3):
    """
    Elimina un archivo de forma segura con reintentos
    para evitar errores de PermissionError en Windows
    """
    for attempt in range(max_attempts):
        try:
            if os.path.exists(filepath):
                os.unlink(filepath)
                logger.info(f"Archivo eliminado exitosamente: {filepath}")
            return True
        except PermissionError as e:
            if attempt < max_attempts - 1:
                logger.warning(f"Intento {attempt + 1} falló al eliminar {filepath}, reintentando...")
                time.sleep(delay)
            else:
                logger.error(f"No se pudo eliminar {filepath} después de {max_attempts} intentos: {e}")
                return False
        except Exception as e:
            logger.error(f"Error inesperado al eliminar {filepath}: {e}")
            return False
    return False

def convert_webm_to_wav(webm_path):
    """
    Convierte el audio webm a formato WAV usando pydub
    Retorna la ruta del archivo WAV temporal
    """
    try:
        logger.info(f"Convirtiendo {webm_path} a WAV...")
        
        # Cargar el audio webm
        audio = AudioSegment.from_file(webm_path, format="webm")
        
        # Configurar para mono, 22050 Hz
        audio = audio.set_channels(1)
        audio = audio.set_frame_rate(22050)
        
        # Crear archivo temporal para WAV
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_wav:
            wav_path = temp_wav.name
        
        # Exportar como WAV
        audio.export(wav_path, format="wav")
        
        # Cerrar explícitamente el objeto audio para liberar el archivo
        del audio
        time.sleep(0.1)  # Pequeña espera para asegurar que se libere el archivo
        
        logger.info(f"Audio convertido exitosamente a {wav_path}")
        return wav_path
    
    except Exception as e:
        logger.error(f"Error convirtiendo audio: {str(e)}")
        raise Exception(f"No se pudo convertir el audio. Asegúrate de que ffmpeg está instalado: {str(e)}")

def extract_audio_features(audio_path):
    """
    Extrae características prosódicas del audio para análisis de emociones
    """
    try:
        # Cargar el audio
        y, sr = librosa.load(audio_path, duration=5, sr=22050, mono=True)
        
        # Verificar que el audio no esté vacío
        if len(y) == 0:
            raise ValueError("El archivo de audio está vacío")
        
        logger.info(f"Audio cargado: {len(y)} muestras a {sr} Hz")
        
        # 1. Pitch (altura tonal) - indicador clave de emociones
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=75, fmax=400)
        pitch_values = []
        for t in range(pitches.shape[1]):
            index = magnitudes[:, t].argmax()
            pitch = pitches[index, t]
            if pitch > 0:
                pitch_values.append(pitch)
        
        pitch_mean = np.mean(pitch_values) if pitch_values else 0
        pitch_std = np.std(pitch_values) if pitch_values else 0
        pitch_range = max(pitch_values) - min(pitch_values) if pitch_values else 0
        
        # 2. Energía/Intensidad (RMS)
        rms = librosa.feature.rms(y=y)[0]
        energy_mean = np.mean(rms)
        energy_std = np.std(rms)
        
        # 3. Tempo (velocidad del habla)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # 4. Zero Crossing Rate (cambios en la señal)
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        zcr_mean = np.mean(zcr)
        
        # 5. Spectral Centroid (brillo del sonido)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_centroid_mean = np.mean(spectral_centroids)
        
        # 6. MFCC (características del timbre vocal)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfccs, axis=1)
        
        return {
            'pitch_mean': float(pitch_mean),
            'pitch_std': float(pitch_std),
            'pitch_range': float(pitch_range),
            'energy_mean': float(energy_mean),
            'energy_std': float(energy_std),
            'tempo': float(tempo),
            'zcr_mean': float(zcr_mean),
            'spectral_centroid': float(spectral_centroid_mean),
            'mfcc_mean': mfcc_mean.tolist()
        }
    
    except Exception as e:
        logger.error(f"Error extrayendo características: {str(e)}")
        raise

def calculate_emotion_accuracy(features, target_emotion):
    """
    Calcula qué tan bien el audio coincide con la emoción objetivo
    basándose en características prosódicas conocidas
    """
    score = 0  # Empezar desde 0 para ser más estricto
    max_score = 100
    
    pitch_mean = features['pitch_mean']
    pitch_std = features['pitch_std']
    pitch_range = features['pitch_range']
    energy_mean = features['energy_mean']
    energy_std = features['energy_std']
    tempo = features['tempo']
    zcr_mean = features['zcr_mean']
    spectral_centroid = features['spectral_centroid']
    
    logger.info(f"Analizando emoción: {target_emotion}")
    logger.info(f"Pitch promedio: {pitch_mean:.2f} Hz")
    logger.info(f"Energía promedio: {energy_mean:.4f}")
    logger.info(f"Tempo: {tempo:.2f} BPM")
    logger.info(f"Desviación pitch: {pitch_std:.2f} Hz")
    
    if target_emotion == 'happy':
        # FELIZ: Pitch alto, mucha variación, energía alta, tempo rápido
        # Puntaje base por intentarlo
        score = 30
        
        # Pitch alto (>180 Hz para voces infantiles)
        if pitch_mean > 240:
            score += 20
        elif pitch_mean > 210:
            score += 15
        elif pitch_mean > 180:
            score += 8
        else:
            score -= 5  # Penalización si está muy bajo
        
        # Variación del pitch (entusiasmo) - MUY IMPORTANTE
        if pitch_std > 40:
            score += 20
        elif pitch_std > 25:
            score += 12
        elif pitch_std > 15:
            score += 5
        else:
            score -= 5  # Habla muy monótona
        
        # Energía alta - CRÍTICO
        if energy_mean > 0.15:
            score += 20
        elif energy_mean > 0.10:
            score += 12
        elif energy_mean > 0.07:
            score += 5
        else:
            score -= 8  # Habla muy suave
        
        # Tempo rápido
        if tempo > 140:
            score += 15
        elif tempo > 120:
            score += 10
        elif tempo > 100:
            score += 5
        else:
            score -= 3
        
        # Brillo del sonido
        if spectral_centroid > 2200:
            score += 10
        elif spectral_centroid > 1800:
            score += 5
            
    elif target_emotion == 'sad':
        # TRISTE: Pitch bajo, poca variación, energía baja, tempo lento
        score = 30
        
        # Pitch bajo
        if pitch_mean < 140:
            score += 20
        elif pitch_mean < 160:
            score += 15
        elif pitch_mean < 180:
            score += 8
        else:
            score -= 5
        
        # Poca variación del pitch (monotonía) - CRÍTICO
        if pitch_std < 12:
            score += 20
        elif pitch_std < 20:
            score += 12
        elif pitch_std < 30:
            score += 5
        else:
            score -= 5  # Demasiada variación para tristeza
        
        # Energía baja - MUY IMPORTANTE
        if energy_mean < 0.05:
            score += 20
        elif energy_mean < 0.07:
            score += 12
        elif energy_mean < 0.09:
            score += 5
        else:
            score -= 8  # Habla muy fuerte
        
        # Tempo lento
        if tempo < 70:
            score += 15
        elif tempo < 85:
            score += 10
        elif tempo < 100:
            score += 5
        else:
            score -= 3
        
        # Sonido más apagado
        if spectral_centroid < 1300:
            score += 10
        elif spectral_centroid < 1600:
            score += 5
            
    elif target_emotion == 'angry':
        # ENOJADO: Pitch alto y variable, energía muy alta, tempo rápido irregular
        score = 30
        
        # Pitch alto (tensión vocal)
        if pitch_mean > 250:
            score += 20
        elif pitch_mean > 220:
            score += 12
        elif pitch_mean > 190:
            score += 5
        else:
            score -= 5
        
        # Mucha variación (intensidad emocional) - CRÍTICO
        if pitch_std > 50:
            score += 20
        elif pitch_std > 35:
            score += 12
        elif pitch_std > 25:
            score += 5
        else:
            score -= 5
        
        # Energía muy alta - MUY IMPORTANTE
        if energy_mean > 0.18:
            score += 25
        elif energy_mean > 0.14:
            score += 15
        elif energy_mean > 0.10:
            score += 5
        else:
            score -= 10  # No hay suficiente intensidad
        
        # Tempo rápido
        if tempo > 150:
            score += 15
        elif tempo > 130:
            score += 10
        elif tempo > 110:
            score += 5
        else:
            score -= 3
        
        # ZCR alto (más ruido/aspereza en la voz)
        if zcr_mean > 0.09:
            score += 10
        elif zcr_mean > 0.07:
            score += 5
    
    # Normalizar el score al rango 0-100
    final_score = min(100, max(0, score))
    
    logger.info(f"Score calculado: {final_score}")
    return final_score

@app.route('/analyze-emotion', methods=['POST'])
def analyze_emotion():
    """
    Endpoint para analizar la emoción en un archivo de audio
    """
    webm_path = None
    wav_path = None
    try:
        logger.info("Recibiendo solicitud de análisis de emoción")
        
        # Verificar que se envió un archivo
        if 'audio' not in request.files:
            logger.error("No se encontró archivo de audio en la solicitud")
            return jsonify({'error': 'No se envió archivo de audio'}), 400
        
        audio_file = request.files['audio']
        target_emotion = request.form.get('emotion', 'happy')
        
        logger.info(f"Emoción objetivo: {target_emotion}")
        logger.info(f"Archivo recibido: {audio_file.filename}, Content-Type: {audio_file.content_type}")
        
        if audio_file.filename == '':
            return jsonify({'error': 'Archivo vacío'}), 400
        
        # Guardar temporalmente el archivo webm
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as temp_file:
            webm_path = temp_file.name
            audio_file.save(webm_path)
        
        logger.info(f"Archivo webm guardado en: {webm_path}")
        logger.info(f"Tamaño del archivo: {os.path.getsize(webm_path)} bytes")
        
        try:
            # Convertir webm a wav
            wav_path = convert_webm_to_wav(webm_path)
            
            # Extraer características del audio convertido
            features = extract_audio_features(wav_path)
            
            # Calcular precisión de la emoción
            accuracy = calculate_emotion_accuracy(features, target_emotion)
            
            # Esperar un momento para asegurar que todos los procesos terminen
            time.sleep(0.2)
            
            # Limpiar archivos temporales de forma segura
            if webm_path:
                safe_remove_file(webm_path)
            if wav_path:
                safe_remove_file(wav_path)
            webm_path = None
            wav_path = None
            
            logger.info(f"Análisis completado con precisión: {accuracy}%")
            
            return jsonify({
                'accuracy': accuracy,
                'emotion': target_emotion,
                'features': {
                    'pitch_mean': features['pitch_mean'],
                    'energy_mean': features['energy_mean'],
                    'tempo': features['tempo'],
                    'pitch_std': features['pitch_std']
                }
            })
        
        except Exception as e:
            logger.error(f"Error durante el análisis: {str(e)}", exc_info=True)
            # Esperar un momento antes de limpiar
            time.sleep(0.2)
            # Limpiar archivos temporales en caso de error
            if webm_path:
                safe_remove_file(webm_path)
            if wav_path:
                safe_remove_file(wav_path)
            webm_path = None
            wav_path = None
            raise
    
    except Exception as e:
        logger.error(f"Error procesando audio: {str(e)}", exc_info=True)
        # Esperar un momento antes de limpiar
        time.sleep(0.2)
        # Asegurarse de limpiar los archivos temporales
        if webm_path:
            safe_remove_file(webm_path)
        if wav_path:
            safe_remove_file(wav_path)
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de salud para verificar que el servicio está corriendo"""
    return jsonify({'status': 'ok', 'service': 'emotion-analysis'})

if __name__ == '__main__':
    logger.info("Iniciando servicio de análisis de emociones...")
    app.run(host='0.0.0.0', port=5000, debug=True)
