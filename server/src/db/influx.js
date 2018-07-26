const Influx = require('influx');
const influx = new Influx.InfluxDB({
 host: 'localhost',
 database: 'round_trip_db',
 schema: [
   {
     measurement: 'round_trip',
     fields: {
      dnsLookup : Influx.FieldType.FLOAT,
      tcpConnection : Influx.FieldType.FLOAT,
      tlsHandshake : Influx.FieldType.FLOAT,
      firstByte : Influx.FieldType.FLOAT,
      contentTransfer : Influx.FieldType.FLOAT, 
      total: Influx.FieldType.FLOAT,
      time :Influx.FieldType.INTEGER
     },
     tags: [
       'host'
     ]
   },
   {
    measurement: 'latency',
    fields: {
      min : Influx.FieldType.FLOAT,
      max : Influx.FieldType.FLOAT,
      avg : Influx.FieldType.FLOAT,
      time :Influx.FieldType.INTEGER
    },
    tags: [
      'host'
    ]
  },
  {
    measurement: 'http_requests',
    fields: {
      method : Influx.FieldType.STRING,
      url : Influx.FieldType.STRING,
      duration : Influx.FieldType.FLOAT,
      time :Influx.FieldType.INTEGER
    },
    tags: [
      'host'
    ]
  }
 ]
});

influx.getDatabaseNames()
  .then(names => {
    if (!names.includes('round_trip_db')) {
      return influx.createDatabase('round_trip_db');
    }
  })
  .then(() => {
  })
  .catch(err => {
    console.error(`Error creating Influx database!`);
  });

module.exports = influx;