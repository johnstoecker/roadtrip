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

# Decode the JSON from Twitter
# datajson = json.loads(data)

#grab the 'created_at' data from the Tweet to use for display
created_at = datajson['created_at']

#print out a message to the screen that we have collected a tweet
print("Tweet collected at " + str(created_at))


auth = tweepy.OAuthHandler(CONSUMER_KEY, CONSUMER_SECRET)
auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)


last_tweet = db.tweets.find().limit(1).sort({$natural:-1})

api = tweepy.API(auth)
new_tweets = api.home_timeline(since_id=last_tweet.id_str,count=200)

#insert the data into the mongoDB into a collection called twitter_search
#if twitter_search doesn't exist, it will be created.
db.tweets.insert(new_tweets)
