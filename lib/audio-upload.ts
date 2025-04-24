"use client"

/**
 * Uploads an audio blob to the speech-to-text API for transcription
 * @param audioBlob The audio blob to upload
 * @returns The transcribed text from the audio
 */
export async function uploadAudioForTranscription(audioBlob: Blob): Promise<string> {
  try {
    // Create a FormData object to send the audio file
    const formData = new FormData()
    formData.append('audio', audioBlob, `recording-${Date.now()}.m4a`)
    
    // Get the auth token from localStorage
    const authToken = localStorage.getItem('authToken')
    
    // Make the API request
    const response = await fetch('https://chat-sdk-backend.onrender.com/chat/upload-audio', {
      method: 'POST',
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to transcribe audio')
    }
    
    const data = await response.json()
    console.log('data in data',data);
    return data.response || ''
  } catch (error) {
    console.error('Error uploading audio:', error)
    throw error
  }
}
