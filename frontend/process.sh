#!/bin/bash
# set -x
echo "Starting frontend process"

inputFile="$( pwd )/$1"
outputFile="$( pwd )/$2"
reverse=$3
speed=$4
roomName=$5
tempOutFile="$inputFile-$roomName-temp"
inputFile="$inputFile.mp3"
reverseFile=""
speedFile=""
echo "Input file: $inputFile, exists $( [ -f "$inputFile" ] && echo "yes" || echo "no" )"
echo "Output file: $outputFile"
if [ "$reverse" = "True" ]; then
    ffmpeg -i $inputFile -vf reverse -af areverse "$tempOutFile-reverse.mp3"
    reverseFile="$tempOutFile-reverse.mp3"
    inputFile="$tempOutFile-reverse.mp3"
fi

if ! [ "$speed" = "1.00" ]; then
    ffmpeg -i $inputFile -filter:a "atempo=$speed" "$tempOutFile-speed.mp3"
    speedFile="$tempOutFile-speed.mp3"
    inputFile="$tempOutFile-speed.mp3"
fi

cp $inputFile $outputFile

#if file exists
if [ -f $reverseFile ]; then
    rm "$reverseFile"
fi

if [ -f $speedFile ]; then
    rm "$speedFile"
fi
