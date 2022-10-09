import subprocess
import os

def process(inputFile, outputFile, songOptions, roomName):
    print(os.path.join(os.path.dirname(__file__), "process.sh"))
    process = subprocess.run(
        [
            os.path.join(os.path.dirname(__file__), "process.sh"),
            inputFile.split(".mp3")[0],
            outputFile,
            songOptions["reverse"],
            songOptions["speed"],
            roomName
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.join("frontend", "static")
    )
    
    print(process.stdout)
    print(process.stderr)
    if process.returncode != 0:
        print("Error while processing song")

    return outputFile

def processWindows(inputFile, outputFile, roomName):
    print(os.path.join(os.path.dirname(__file__), "process.bat"))
    process = subprocess.run(
        [
            os.path.join(os.path.dirname(__file__), "process.bat"),
            inputFile.split(".mp3")[0],
            outputFile,
            roomName
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.join("frontend", "static")
    )
    
    print(process.stdout)
    print(process.stderr)
    if process.returncode != 0:
        print("Error while processing song")

    return outputFile