import spacy
import pdfplumber
from docx import Document
import re
import json
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Load spaCy NLP model
nlp = spacy.load('en_core_web_sm')

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
    return text

# Function to extract text from DOCX
def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

# Function to extract text based on file extension
def extract_text(file_path):
    if file_path.endswith('.pdf'):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file format")

# Function to extract emails using regex
def extract_emails(text):
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails

# Function to extract phone numbers using regex (more than 7 digits long)
def extract_phone_numbers(text):
    phone_pattern = r'\+?[0-9][0-9\-\(\)\s]+[0-9]'
    phone_numbers = re.findall(phone_pattern, text)
    valid_phone_numbers = [phone for phone in phone_numbers if len(re.sub(r'\D', '', phone)) > 7]
    return valid_phone_numbers

# Function to extract named entities (like name, qualifications) using spaCy NER
def extract_named_entities(text):
    doc = nlp(text)
    entities = {"PERSON": [], "ORG": [], "GPE": [], "EDUCATION": [], "SKILL": []}
    
    for ent in doc.ents:
        if ent.label_ == 'PERSON':
            entities["PERSON"].append(ent.text)
        elif ent.label_ == 'ORG':  # Assuming organization is mentioned for qualifications
            entities["ORG"].append(ent.text)
        elif ent.label_ == 'GPE':  # GPE: Geopolitical Entity, could be used for location or education-related context
            entities["GPE"].append(ent.text)
    
    return entities

# Function to extract education qualifications (e.g., Bachelor, Master, etc.)
def extract_education(text):
    education_keywords = ['Bachelor', 'Master', 'PhD', 'B.Sc', 'M.Sc', 'B.Tech', 'M.Tech', 'Engineering', 'Degree', 'Diploma']
    education_lines = [line for line in text.split("\n") if any(keyword in line for keyword in education_keywords)]
    return education_lines if education_lines else None

# Function to extract qualifications (certifications, professional courses)
def extract_qualifications(text):
    qualifications_keywords = ['Certified', 'Certification', 'Diploma', 'Course', 'Training']
    qualifications_lines = [line for line in text.split("\n") if any(keyword in line for keyword in qualifications_keywords)]
    return qualifications_lines if qualifications_lines else None

# Function to extract projects (e.g., "Project", "Developed", "Implemented")
def extract_projects(text):
    project_keywords = ['Project', 'Developed', 'Designed', 'Implemented', 'Built', 'Created']
    projects_lines = [line for line in text.split("\n") if any(keyword in line for keyword in project_keywords)]
    return projects_lines if projects_lines else None

# Function to authenticate and create Google Sheets API service
def get_google_sheets_service():
    credentials = Credentials.from_service_account_file(
        'path/to/your/service-account.json',  # Replace with the path to your service account file
        scopes=["https://www.googleapis.com/auth/spreadsheets"]
    )
    service = build('sheets', 'v4', credentials=credentials)
    return service

# Function to write data to Google Sheets
def write_to_google_sheet(spreadsheet_id, data):
    try:
        service = get_google_sheets_service()
        sheet = service.spreadsheets()

        # Write the data to a sheet starting at row 2 (assuming row 1 contains headers)
        request = sheet.values().update(
            spreadsheetId=spreadsheet_id,
            range="Sheet1!A2:F2",  # Adjust this range as needed
            valueInputOption="RAW",
            body={"values": [data]}
        )
        request.execute()
        print("Data written to Google Sheets successfully.")
    except HttpError as err:
        print(f"Error writing to Google Sheets: {err}")

# Lambda function handler
def lambda_handler(event, context):
    file_path = event['file_path']  # Assuming file path is passed in the event
    spreadsheet_id = event['spreadsheet_id']  # Google Sheets ID passed in the event

    # Extract text from the file
    cv_text = extract_text(file_path)

    # Extract different parts of the resume using NLP
    emails = extract_emails(cv_text)
    phone_numbers = extract_phone_numbers(cv_text)
    entities = extract_named_entities(cv_text)
    education = extract_education(cv_text)
    qualifications = extract_qualifications(cv_text)
    projects = extract_projects(cv_text)

    # Prepare the data to be sent to Google Sheets
    data = [
        ', '.join(emails),
        ', '.join(phone_numbers),
        ', '.join(entities["PERSON"]),
        ', '.join(education if education else []),
        ', '.join(qualifications if qualifications else []),
        ', '.join(projects if projects else [])
    ]
    
    # Write the data to Google Sheets
    write_to_google_sheet(spreadsheet_id, data)

    return {
        'statusCode': 200,
        'body': json.dumps('Successfully processed and sent data to Google Sheets')
    }
