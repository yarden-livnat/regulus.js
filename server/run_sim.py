import subprocess

def runwithparam(params):
    subprocess.run(params, check=True)