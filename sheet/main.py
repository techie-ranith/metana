from flask import Flask, request, jsonify
import threading
import os
from dotenv import load_dotenv

# Import CV processing functions
from cv_processing import process_cv  # Assuming your CV processing logic is in cv_processing.py

# Load environment variables
load_dotenv()

# Flask app initialization
app = Flask(__name__)

@app.route("/process_cv", methods=["POST"])
def process_cv_endpoint():
    """Endpoint to receive CV data and process it."""
    try:
        cv_data = request.json  # Expecting JSON input
        if not cv_data or "resume_publicUrl" not in cv_data:
            return jsonify({"error": "Invalid input, missing resume_publicUrl"}), 400
        
        # Process CV asynchronously
        threading.Thread(target=process_cv, args=(cv_data,)).start()
        
        return jsonify({"message": "CV processing started"}), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
