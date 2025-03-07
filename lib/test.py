import pdfplumber
from docx import Document
import re

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

# Function to extract phone numbers using regex, filtering for numbers greater than 7 digits
def extract_phone_numbers(text):
    phone_pattern = r'\+?[0-9][0-9\-\(\)\s]+[0-9]'
    phone_numbers = re.findall(phone_pattern, text)
    # Filter phone numbers with more than 7 digits
    valid_phone_numbers = [phone for phone in phone_numbers if len(re.sub(r'\D', '', phone)) > 7]
    return valid_phone_numbers

# Function to extract skills from a predefined list
def extract_skills(text):
    skills = ['Python', 'JavaScript', 'Java', 'SQL', 'Machine Learning', 'Data Analysis']
    skills_found = [skill for skill in skills if skill.lower() in text.lower()]
    return skills_found

# Function to extract education qualifications (e.g., Bachelor, Master, PhD)
def extract_education(text):
    education_keywords = ['Bachelor', 'Master', 'PhD', 'B.Sc', 'M.Sc', 'B.Tech', 'M.Tech', 'Engineering', 'Degree', 'Diploma']
    education_lines = [line for line in text.split("\n") if any(keyword in line for keyword in education_keywords)]
    return education_lines if education_lines else None

# Function to extract qualifications (e.g., certifications, professional courses)
def extract_qualifications(text):
    qualifications_keywords = ['Certified', 'Certification', 'Diploma', 'Course', 'Training']
    qualifications_lines = [line for line in text.split("\n") if any(keyword in line for keyword in qualifications_keywords)]
    return qualifications_lines if qualifications_lines else None

# Function to extract projects (e.g., "Project", "Developed", "Implemented")
def extract_projects(text):
    project_keywords = ['Project', 'Developed', 'Designed', 'Implemented', 'Built', 'Created']
    projects_lines = [line for line in text.split("\n") if any(keyword in line for keyword in project_keywords)]
    return projects_lines if projects_lines else None

# Example usage
file_path = "D:/Ranith Personal/Normal Resume/Ranith Resume.pdf"  # Replace with your file path
cv_text = extract_text(file_path)

# Extract different parts of the resume
emails = extract_emails(cv_text)
phone_numbers = extract_phone_numbers(cv_text)
skills = extract_skills(cv_text)
education = extract_education(cv_text)
qualifications = extract_qualifications(cv_text)
projects = extract_projects(cv_text)

# Print extracted details
print(f"Emails: {emails}")
print(f"Phone Numbers: {phone_numbers}")
print(f"Skills: {skills}")
print(f"Education: {education}")
print(f"Qualifications: {qualifications}")
print(f"Projects: {projects}")
