const db = require('./config/connection');
const LRU = require('lru-cache');
const { User } = require('./models');
const countries = ['Armenia', 'Afghanistan', 'Romania'];
const cache = new LRU({
	max: 2,
});
const iterations = 50000;

(async function () {
	// warmup
	await timer(withoutCache, 'Warmup without cache');

	// real deal
	await timer(withCache, 'With Cache');
	await timer(withoutCache, 'Without Cache');

	process.exit(0);
})();

async function withCache() {
	const users = [];

	for (let i = 0; i < iterations; i++) {
		const country = countries[Math.floor(Math.random() * countries.length)];
		const userFromCache = cache.get(country);

		if (userFromCache) {
			users.push(userFromCache);
		} else {
			const userFromDb = await User.findOne({ country });
			cache.set(country, userFromDb);
			users.push(userFromDb);
		}
	}

	return users;
}

async function withoutCache() {
	const users = [];

	for (let i = 0; i < iterations; i++) {
		const country = countries[Math.floor(Math.random() * countries.length)];
		const userFromDb = await User.findOne({ country });
		users.push(userFromDb);
	}

	return users;
}

async function timer(fn, id) {
	let start = process.hrtime();

	await fn();

	let stop = process.hrtime(start);

	console.log(`${id} execution time: ${(stop[0] * 1e9 + stop[1]) / 1e9} seconds`);
}
