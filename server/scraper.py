from __future__ import print_function
import tweepy
import json
from pymongo import MongoClient

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
    new_tweets = api.home_timeline(since_id=record.id,count=200)
except StopIteration:
    new_tweets = api.home_timeline(count=200)

for s in new_tweets:
    if db.tweets.find_one({'text':s.text}) == None: # prevent duplicate tweets being stored
        tweet_to_save = {'text':s.text, 'id':s.id, 'created_at':s.created_at,'screen_name':s.author.screen_name,'author_id':s.author.id, 'geo':s.geo, 'coordinates':s.coordinates}
        db.tweets.save(tweet_to_save)
