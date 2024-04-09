require('dotenv').config();
const Ioredis = require('ioredis');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  if (!process.env.VALKEY_HOST) {
    throw Error('You should first fill the .env-example file and rename it to .env');
  }

  // Connect to Valkey server
  console.log();
  console.log('🔌  Connecting to Valkey...');
  console.log();

  const valkey = new Ioredis({
    host: process.env.VALKEY_HOST,
    port: 6380, // This is the TLS port (communications will be encrypted)
    password: process.env.VALKEY_PASSWORD,
    db: 0,
    tls: {} // To activate TLS support (encryption)
  });

  // This is a good practice to close Valkey connection when the Node.js process receives the signal "TERM".
  process.once('SIGTERM', () => valkey.disconnect());


  // SET/GET/DEL examples
  console.log('-'.repeat(80));
  console.log('🌟 SET/GET/DEL examples');
  console.log();

  console.log('➡️  Setting key "stackhero-example-key" to value "abcd"');
  await valkey.set('stackhero-example-key', 'abcd');
  console.log();

  console.log('➡️  Getting key "stackhero-example-key" value...');
  const value = await valkey.get('stackhero-example-key');
  console.log(`⬅️  Key "stackhero-example-key" has value "${value}"`);
  console.log();

  console.log('➡️  Deleting key "stackhero-example-key"');
  await valkey.del('stackhero-example-key');
  console.log();


  // SADD/SMEMBERS examples
  console.log('-'.repeat(80));
  console.log('🌟 SADD/SMEMBERS examples');
  console.log();

  console.log('➡️  Add values "value1", "value2" and "value3" to the set key "stackhero-example-set"');
  await valkey.sadd('stackhero-example-set', [ 'value1', 'value2', 'value3' ]);
  console.log();

  console.log('➡️  Getting members from the set key "stackhero-example-set"');
  const values = await valkey.smembers('stackhero-example-set');
  console.log(`⬅️  Set key "stackhero-example-set" has values "${values}"`);
  console.log();


  // PUB/SUB examples
  console.log('-'.repeat(80));
  console.log('🌟 PUB/SUB examples');
  console.log();

  console.log('➡️  [valkey] Subscribing to "users" and "events"');
  await valkey.subscribe([ 'users', 'events' ]);
  console.log();

  // Listening to messages
  valkey.on('message', (channel, message) => {
    console.log(`⬅️  [valkey] Receive message "${message}" from channel "${channel}"`);
    console.log();
  });


  // As we "subscribe" to channels, our "valkey" client can't be use anymore for other commands than SUBSCRIBE, PSUBSCRIBE, UNSUBSCRIBE, PUNSUBSCRIBE, PING and QUIT.
  // We create a new "valkeyPub" client with the same connection options from the "valkey" one.
  const valkeyPub = valkey.duplicate();

  // This is a good practice to close Valkey connection when the Node.js process receives the signal "TERM".
  process.once('SIGTERM', () => valkeyPub.disconnect());


  console.log('➡️  [valkeyPub] Sending message to channel "users"');
  await valkeyPub.publish('users', 'I\'m a new user!');
  // We wait 200ms to be sure than the message has been received. It just for the demo, to have the "Sending message" and "Receive message" one after the other.
  await delay(200);

  console.log('➡️  [valkeyPub] Sending message to channel "events"');
  await valkeyPub.publish('events', 'Here is a new event!');
  // We wait 200ms to be sure than the message has been received. It just for the demo, to have the "Sending message" and "Receive message" one after the other.
  await delay(200);




  console.log('-'.repeat(80));
  console.log('👋 Disconnecting "valkey" and "valkeyPub" clients');
  await valkey.disconnect();
  await valkeyPub.disconnect();
  console.log();


  // console.log(`➡️  Sending to "users" and "messages"`);
  // valkey.publish('', "Hello world!");


  // // ADD PUB/SUB EXAMPLES
  // valkey.subscribe("news", "music", function(err, count) {
  //   // Now we are subscribed to both the 'news' and 'music' channels.
  //   // `count` represents the number of channels we are currently subscribed to.

  //   pub.publish("news", "Hello world!");
  //   pub.publish("music", "Hello again!");
  // });

  // valkey.on("message", function(channel, message) {
  //   // Receive message Hello world! from channel news
  //   // Receive message Hello again! from channel music
  //   console.log("Receive message %s from channel %s", message, channel);
  // });

  // // There's also an event called 'messageBuffer', which is the same as 'message' except
  // // it returns buffers instead of strings.
  // valkey.on("messageBuffer", function(channel, message) {
  //   // Both `channel` and `message` are buffers.
  // });


  // You will get a lot of others examples on the ioredis repository: https://github.com/luin/ioredis
})().catch(error => {
  console.error('');
  console.error('🐞 An error occurred!');
  console.error(error);
  process.exit(1);
});