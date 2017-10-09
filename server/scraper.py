from __future__ import print_function
import tweepy
import json
from pymongo import MongoClient

import json

with open('pixel_map.json') as json_data:
    pixelMap = json.load(json_data)

    MONGO_HOST= 'mongodb://localhost/ironmapsdb'  # assuming you have mongoDB installed locally
                                                 # and a database called 'twitterdb'

    CONSUMER_KEY = "KEY"
    CONSUMER_SECRET = "SECRET"
    ACCESS_TOKEN = "TOKEN"
    ACCESS_TOKEN_SECRET = "TOKEN_SECRET"


    client = MongoClient(MONGO_HOST)

    # Use twitterdb database. If it doesn't exist, it will be created.
    db = client.ironmapsdb

    auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
    auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)


    cursor = db.tweets.find().limit(1).sort([("id", -1)])

    api = tweepy.API(auth)

    try:
        record = cursor.next()
        print(record["id"])
        new_tweets = api.home_timeline(since_id=record["id"],count=200)
    except StopIteration:
        new_tweets = api.home_timeline(count=200)

    for s in reversed(new_tweets):
        if db.tweets.find_one({'text':s.text}) == None: # prevent duplicate tweets being stored
            print(s)
            if s.coordinates:
                coords = s.coordinates["coordinates"]
                # // top left coords in pixelMap
                # // tweets are in [long, lat]
                for pm in pixelMap:
                #     -122.14310264,37.05701649
                #    "longitude":-122.4992,"latitude":37.6336
                    if pm["latitude"]>coords[1] and pm["longitude"]<coords[0] and pm["latitude"]-0.81<coords[1] and pm["longitude"]+0.81>coords[0]:
                        s.pixel_coords = pm["coords"]
            try:
                tweet_to_save = {'text':s.text, 'id':s.id, 'created_at':s.created_at,'screen_name':s.author.screen_name,'author_id':s.author.id, 'geo':s.geo, 'coordinates':s.coordinates, 'pixel_coords': s.pixel_coords, 'entities': s.entities}
            except AttributeError:
                tweet_to_save = {'text':s.text, 'id':s.id, 'created_at':s.created_at,'screen_name':s.author.screen_name,'author_id':s.author.id, 'geo':s.geo, 'coordinates':s.coordinates, 'entities': s.entities}
            db.tweets.save(tweet_to_save)
