import os
import requests
import smtplib
import schedule
import time
import datetime
import pdfplumber
import docx
from dotenv import load_dotenv
from email.message import EmailMessage
from googleSheetConnect import append_to_google_sheets  # Import the function

# Load environment variables
load_dotenv()

# Webhook and Email Configuration
WEBHOOK_URL = os.getenv("WEBHOOK_URL")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def fetch_resume_from_lightsail(public_url):
    """Fetches the resume from the Lightsail storage bucket public URL."""
    response = requests.get(public_url)
    if response.status_code == 200:
        file_name = public_url.split("/")[-1]
        with open(file_name, "wb") as file:
            file.write(response.content)
        return file_name
    else:
        raise Exception(f"Failed to fetch resume from {public_url}")

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF CV."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(docx_path):
    """Extracts text from a DOCX CV."""
    doc = docx.Document(docx_path)
    return "\n".join([para.text for para in doc.paragraphs])

def extract_cv_info(file_path):
    """Extracts relevant information from CV text."""
    file_extension = file_path.split('.')[-1]
    if file_extension == "pdf":
        text = extract_text_from_pdf(file_path)
    elif file_extension == "docx":
        text = extract_text_from_docx(file_path)
    else:
        return None
    
    lines = text.split("\n")
    personal_info = {"name": lines[0], "email": "example@example.com", "phone": "1234567890"}
    education = [line for line in lines if "BSc" in line or "MSc" in line]
    qualifications = [line for line in lines if "Certified" in line]
    projects = [line for line in lines if "Project" in line]
    
    return {
        "personal_info": personal_info,
        "education": education,
        "qualifications": qualifications,
        "projects": projects,
    }

def send_webhook(cv_data):
    """Sends processed CV data to webhook endpoint."""
    payload = {
        "cv_data": {
            **cv_data,
            "cv_public_link": cv_data["resume_publicUrl"]
        },
        "metadata": {
            "applicant_name": cv_data["name"],
            "email": cv_data["email"],
            "status": "prod",
            "cv_processed": True,
            "processed_timestamp": datetime.datetime.utcnow().isoformat()
        }
    }
    headers = {"X-Candidate-Email": cv_data["email"]}
    requests.post(WEBHOOK_URL, headers=headers, json=payload)

def send_followup_email(recipient_email):
    """Sends a follow-up email."""
    msg = EmailMessage()
    msg["Subject"] = "Your Job Application is Under Review"
    msg["From"] = EMAIL_ADDRESS
    msg["To"] = recipient_email
    msg.set_content("Hello,\n\nYour job application is under review. We will update you soon.\n\nBest regards,\nMetana Team")
    
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(msg)

# Schedule Email to be Sent the Next Day
def schedule_email(recipient_email):
    """Schedules an email to be sent at 09:00 the next day."""
    def job():
        send_followup_email(recipient_email)
    
    schedule.every().day.at("09:00").do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

# Process CV
def process_cv(cv_data):
    """Processes the CV data received from the API request."""
    file_name = fetch_resume_from_lightsail(cv_data["resume_publicUrl"])
    extracted_cv_data = extract_cv_info(file_name)
    
    # Store in Google Sheets using imported function
    append_to_google_sheets([
        cv_data["name"],
        cv_data["email"],
        cv_data["phone"],
        cv_data["education"],
        cv_data["qualification"],
        cv_data["projects"],
        cv_data["resume_publicUrl"]
    ])
    
    send_webhook(cv_data)
    schedule_email(cv_data["email"])

# Example usage
# process_cv({
#     "name": "John Doe",
#     "email": "johndoe@example.com",
#     "phone": "1234567890",
#     "education": "BSc in Computer Science",
#     "qualification": "Certified Python Developer",
#     "projects": "AI-based Resume Parser",
#     "resume_publicUrl": "https://your-lightsail-bucket-url/cv.pdf"
# })
