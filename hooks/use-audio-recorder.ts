"use client"

import { useState, useCallback, useRef, useEffect } from "react"

type RecordingState = "idle" | "recording" | "processing"

interface AudioRecorderResult {
  recordingState: RecordingState
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  error: string | null
  isRecordingSupported: boolean
}

export function useAudioRecorder(): AudioRecorderResult {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isRecordingSupported, setIsRecordingSupported] = useState<boolean>(true)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  // Check if recording is supported
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsRecordingSupported(false)
      setError("Audio recording is not supported in this browser")
    }
  }, [])
  
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      chunksRef.current = []
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create media recorder instance
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      // Start recording
      mediaRecorder.start()
      setRecordingState("recording")
    } catch (err) {
      console.error("Error starting recording:", err)
      setError("Could not start recording. Please check microphone permissions.")
      setRecordingState("idle")
    }
  }, [])
  
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || recordingState !== "recording") {
        setRecordingState("idle")
        resolve(null)
        return
      }
      
      setRecordingState("processing")
      
      // Set up event handler for when recording stops
      mediaRecorderRef.current.onstop = () => {
        // Combine all chunks into a single blob
        const audioBlob = new Blob(chunksRef.current, { type: "audio/x-m4a" })
        setRecordingState("idle")
        resolve(audioBlob)
        
        // Stop all audio tracks
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
      }
      
      // Stop the recording
      mediaRecorderRef.current.stop()
    })
  }, [recordingState])
  
  return {
    recordingState,
    startRecording,
    stopRecording,
    error,
    isRecordingSupported
  }
}
