import pandas as pd
import collections
import numpy as np
DIR_NAMES = ['yaejima_ferry', 'ogami_kaiun', 'tarama_kaiun', 'yasuei_kanko', 'hunauki_kaiun', 'hukuyama_kaiun', 'urauti', 'izena']

def read_data(dir, file):
  data = pd.read_csv(dir + '/' + file)
  return data

def change_timestamp(string):
  hour = int(string.split(':')[0]) * 60
  min = int(string.split(':')[1])
  return hour + min

def flatten(l):
    for el in l:
        if isinstance(el, collections.abc.Iterable) and not isinstance(el, (str, bytes)):
            yield from flatten(el)
        else:
            yield el

def main(dir):
  stop = read_data(dir, 'stops.txt')
  route = read_data(dir, 'routes.txt')
  trip = read_data(dir, 'trips.txt')
  time = read_data(dir, 'stop_times.txt')
  rule = read_data(dir, 'fare_rules.txt')

  rule_org = pd.merge(rule, stop, left_on='origin_id', right_on='stop_id')
  rule_stop = pd.merge(rule_org, stop, left_on='destination_id', right_on='stop_id')
  rule_trip = pd.merge(rule_stop, trip, left_on='route_id', right_on='route_id')
  rule_time = pd.merge(rule_trip, time, left_on='trip_id', right_on='trip_id')

  columns = [
    'stop_name_x',
    'stop_lat_x',
    'stop_lon_x',
    'stop_name_y',
    'stop_lat_y',
    'stop_lon_y',
    'trip_id',
    'arrival_time',
    'departure_time',
    'stop_sequence'
  ]
  rule_time = rule_time[columns].drop_duplicates()
  trip_ids = list(set(rule_time.trip_id))
  data = [rule_time[rule_time.trip_id == id] for id in trip_ids]
  result = []
  for df in data:
    path = []
    timestamps = []
    for index, row in df.iterrows():
      if index % 2 == 1:
        path.append([row['stop_lon_y'], row['stop_lat_y']])
      else:
        path.append([row['stop_lon_x'], row['stop_lat_x']])
      t = change_timestamp(row['arrival_time'])
      timestamps.append(t)
    result.append({
      'vendor': 0,
      'path': path,
      'timestamps': timestamps
    })
  return result

import json

results = [main(dir) for dir in DIR_NAMES]

result = sum(results, [])

# with open(DIR_NAME + '/output.json', 'w') as f:
#   content = json.dumps(result, ensure_ascii=False, indent=4, sort_keys=True, separators=(',', ': '))
#   f.write(content)

with open('../data.json', 'w') as f:
  content = json.dumps(result)
  f.write(content)
# rule_time.to_csv(DIR_NAME + '/output.csv', index=False)