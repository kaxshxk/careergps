import os
import pandas as pd

# BASE_DIR and DATA_DIR are defined once dynamically relative to this file's path.
# This prevents absolute paths like '/app/data/' or 'C:\...' from breaking across environments.
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'data')

def load_skills_data() -> pd.DataFrame:
    """
    Loads skills from the CSV data file using a portable path resolution.
    """
    skills_path = os.path.join(DATA_DIR, 'skills.csv')
    return pd.read_csv(skills_path)

def load_template(template_name: str) -> str:
    """
    Loads a template file dynamically using the base directory.
    """
    templates_dir = os.path.join(BASE_DIR, '..', 'templates')
    template_path = os.path.join(templates_dir, template_name)
    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()
