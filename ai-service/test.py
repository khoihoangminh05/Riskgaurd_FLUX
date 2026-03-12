import google.generativeai as genai

genai.configure(api_key="AIzaSyDwWFKz-ybv4sNVnz2_O16arLQJfm2s9Q8")

for m in genai.list_models():
    print(m.name)