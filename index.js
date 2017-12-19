const readline = require('readline');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const mongoURL = 'mongodb://localhost:27017/firstdb';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'mongoDB-cons> '
});

const addUser = (coll, name) => {
  if (!name) return console.log('==! You need type a name');
  coll.insertOne({ name }, (err, result) => {
    if(err) return console.log(err);
    console.log(`==> ${name} is added.`);
  });
};

const listUsers = (coll) => {
  coll.find().toArray((err, docs) => {
    if (err) return console.log(err);
    if (docs.length === 0) return console.log('There is no names');
    docs.forEach(item => {
      console.log(item.name);
    });
  });
};

const editUser = (coll, name, newName, f) => {
  console.log(name);
  if (!name || !newName) return console.log('==! You need type a two parameters!')
  if (f === 'all') {
    coll.updateMany({ name }, { '$set': { name: newName } })
    .then(r => console.log(`==> ${r.matchedCount} items found and ${r.modifiedCount} modified`));
  } else {
    coll.updateOne({ name }, { '$set': { name: newName } })
    .then(r => console.log(`==> ${r.matchedCount} items found and ${r.modifiedCount} modified`));
  }
};

const delUser = (coll, name, f) => {
  if (!name) return console.log('==! You need type a name');
  if (f === 'all') {
    coll.deleteMany({ name })
    .then(r => console.log(`==> ${r.deletedCount} items removed.`));
  } else {
    coll.deleteOne({ name })
    .then(r => console.log(`==> ${r.deletedCount} items removed.`));
  }
};

MongoClient.connect(mongoURL, (err, db) => {
  if (err) {
    console.log(`Cant connect to DB. Error: ${err}`);
  } else {
    console.log(`Connection to DB success.\n`);
    console.log('Hi! Enter a command:');
    console.log('- "add name" to add a new name to collection;');
    console.log('- "list" to view all names in collection;');
    console.log('- "edit oldname newname all" to edit exist name;\n--- use "all" flag to global query');
    console.log('- "del name all" to remove some name;\n--- use "all" flag to global query');
    console.log('- "q" to exit;');
    console.log('='.repeat(30));
    const collection = db.collection('firstdb');

    rl.prompt();

    rl.on('line', (line) => {
      const command = line.split(' ');
      const args = command.slice(1);
      switch (command[0]) {
        case 'add':
          addUser(collection, ...args);
          break;
        case 'list':
          listUsers(collection);
          break;
        case 'edit':
          editUser(collection, ...args);
          break;
        case 'del':
          delUser(collection, ...args);
          break;
        case 'q':
          console.log('Bye');
          process.exit(0);
          break;
        default:
          console.log(`Invalid command "${command[0]}".`)
      }
      rl.prompt();
    }).on('close', () => {
      console.log('Bye');
      process.exit(0);
    })
  }
});