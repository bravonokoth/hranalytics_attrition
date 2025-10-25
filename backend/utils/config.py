import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME = "HR Analytics Attrition"
    VERSION = "1.0"
    DATA_PATH = os.getenv("DATA_PATH", "data/ibm_hr_attrition.csv")

settings = Settings()
