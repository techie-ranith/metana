import os
import boto3
import json
import requests
import smtplib
import schedule
import time
import datetime
import pdfplumber
import docx
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from email.message import EmailMessage

# AWS S3 Configuration
AWS_ACCESS_KEY = "your_aws_access_key"
AWS_SECRET_KEY = "your_aws_secret_key"
S3_BUCKET_NAME = "your_s3_bucket_name"
s3_client = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_KEY)

# Google Sheets Configuration
SHEET_NAME = "JobApplications"
SERVICE_ACCOUNT_FILE = "google_credentials.json"
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
client = gspread.authorize(creds)
sheet = client.open(SHEET_NAME).sheet1

# Webhook Endpoint
WEBHOOK_URL = "https://rnd-assignment.automations-3d6.workers.dev/"
X_CANDIDATE_EMAIL = "your_email@example.com"

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "your_email@example.com"
EMAIL_PASSWORD = "your_email_password"

def upload_to_s3(file_path, file_name):
    """Uploads CV to S3 and returns public URL."""
    s3_client.upload_file(file_path, S3_BUCKET_NAME, file_name, ExtraArgs={'ACL': 'public-read'})
    return f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{file_name}"

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

def store_in_google_sheets(cv_data, cv_public_link):
    """Stores extracted data in Google Sheets."""
    sheet.append_row([cv_data["personal_info"]["name"], cv_data["personal_info"]["email"],
                      cv_data["personal_info"]["phone"], cv_public_link])

def send_webhook(cv_data, cv_public_link):
    """Sends processed CV data to webhook endpoint."""
    payload = {
        "cv_data": {
            **cv_data,
            "cv_public_link": cv_public_link
        },
        "metadata": {
            "applicant_name": cv_data["personal_info"]["name"],
            "email": X_CANDIDATE_EMAIL,
            "status": "prod",
            "cv_processed": True,
            "processed_timestamp": datetime.datetime.utcnow().isoformat()
        }
    }
    headers = {"X-Candidate-Email": X_CANDIDATE_EMAIL}
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
    schedule.every().day.at("09:00").do(send_followup_email, recipient_email)
    while True:
        schedule.run_pending()
        time.sleep(60)

# Example usage
def process_cv(file_path, file_name, recipient_email):
    cv_public_link = upload_to_s3(file_path, file_name)
    cv_data = extract_cv_info(file_path)
    store_in_google_sheets(cv_data, cv_public_link)
    send_webhook(cv_data, cv_public_link)
    schedule_email(recipient_email)

# process_cv("/path/to/cv.pdf", "cv.pdf", "applicant@example.com")
