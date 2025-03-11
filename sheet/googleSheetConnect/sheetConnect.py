import gspread
from google.oauth2.service_account import Credentials
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Google Sheets Configuration
SHEET_NAME = os.getenv("SHEET_NAME")
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE")

# Define the scope
SCOPES = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

# Authenticate with Google Sheets API
creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
client = gspread.authorize(creds)

# Open the Google Sheet
sheet = client.open(SHEET_NAME).sheet1

def append_to_google_sheets(data):
    """Append data to the Google Sheet."""
    sheet.append_row(data)
