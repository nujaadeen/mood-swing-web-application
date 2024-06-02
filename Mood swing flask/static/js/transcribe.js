


export async function transcribeAudio(audioURL) {
    try {
        // Fetch the transcription endpoint with the audio URL
        const response = await fetch('/transcribe_audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ audioURL }) // Send the audio URL in the body
        });

        // Check if the response is ok
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the response JSON
        let data = await response.json();
        
        
         sessionStorage.setItem('Sentiment',data.overall_sentiment)
        // Handle transcription data as needed
        console.log(data,"yahe ha dora wla");
        return data;
    } catch (error) {
        console.error('Error:', error);
        // Handle error as needed
    }
}

