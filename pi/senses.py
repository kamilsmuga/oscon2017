#!/usr/bin/python

"""Prints info from Sense Hat sensors.

   Support: temperature, humidity, pressure 
   TBD: IMU Sensor
"""

from sense_hat import SenseHat
import time

sense = SenseHat()

def get_temperature():
  print 'Temperature: {0}'.format(sense.temp)  

def get_humidity():
  print("Humidity: %s %%" % sense.humidity) 

def get_pressure():
  print("Pressure: %s hPa" % sense.pressure)

def set_message(message, color=[255, 0, 0]):
  sense.show_message(message, scroll_speed=0.05, text_colour=color)

def set_letter(letter, color=[0, 0, 255]):
  sense.show_letter(letter, text_colour=color)
  time.sleep(1)

while True:
  sense.clear()
  sense.set_rotation(180)
  get_temperature()
  get_humidity()
  get_pressure()
  
  set_message("refocus")
  set_letter("S")
  set_letter("F", color=[0, 0, 150])
  set_letter("D")
  set_letter("C", color=[0, 0, 150])
