from flask import Flask, render_template, request, jsonify
import assemblyai as aai
from dotenv import load_dotenv
import os
app = Flask(__name__,static_url_path='/static')
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)
# Set your AssemblyAI API key
ASSEMBY_API_KEY =os.getenv('ASSEMBLY_AI_API_KEY')
print(ASSEMBY_API_KEY)
aai.settings.api_key = ASSEMBY_API_KEY
firebase_config = {
        "apiKey": os.getenv('FIREBASE_API_KEY'),
        "authDomain": os.getenv('AUTH_DOMAIN'),
        "projectId": os.getenv('PROJECT_ID'),
        "storageBucket": os.getenv('STORAGE_BUCKET'),
        "messagingSenderId": os.getenv('MESSEAGING_SENDER_ID'),
        "appId": os.getenv('APP_ID'),
        "measurementId": os.getenv('MEASURMENT')
    }
@app.route('/')
def index():

    
    return render_template('index.html', firebase_config=firebase_config)

@app.route('/dash')
def dash():
    return render_template('dash.html',firebase_config=firebase_config)

@app.route('/transcribe_audio', methods=['POST'])
def transcribe_audio():
    if request.method == 'POST':
        try:
           
            data = request.json
            # Extract the audio URL from the JSON data
            audio_url = data.get('audioURL')
            # Configuration for transcription with sentiment analysis
            config = aai.TranscriptionConfig(sentiment_analysis=True)

            # Transcribe the audio file
            transcript = aai.Transcriber().transcribe(audio_url, config)

            # Aggregate sentiment analysis results for the entire conversation
            all_text = ""
            all_sentiments = []

            for sentiment_result in transcript.sentiment_analysis:
                all_text += sentiment_result.text + " "
                all_sentiments.append(sentiment_result.sentiment)

            # Calculate overall sentiment for the entire conversation
            if all_sentiments:
                overall_sentiment = max(set(all_sentiments), key=all_sentiments.count)
            else:
                overall_sentiment = "NEUTRAL"  # If no sentiment analysis available

            # Output sentiment analysis results
            result = {
                "overall_sentiment": overall_sentiment,
                "sentiment_analysis": [
                    {
                        "text": sentiment_result.text,
                        "sentiment": sentiment_result.sentiment,
                        "confidence": sentiment_result.confidence
                    }
                    
                ]
            }
            print(result);
            return jsonify(result)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'mp3'


if __name__ == '__main__':
    app.run(debug=True)