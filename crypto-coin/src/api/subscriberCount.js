const express = require('express');
const app = express();

// This is just an example array of subscribers
const subscribers = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
];

// Endpoint for getting the subscriber count
app.get('/api/subscriberCount', (req, res) => {
    const count = subscribers.length;
    res.json({ count });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
