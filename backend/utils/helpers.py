import os

def ensure_dirs(*dirs):
    for d in dirs:
        os.makedirs(d, exist_ok=True)
