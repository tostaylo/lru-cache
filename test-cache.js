const db = require('./config/connection');
const LRU = require('lru-cache');
const { User } = require('./models');

const countries = ['Armenia', 'Afghanistan', 'Romania', 'Greece', 'Tunisia', 'Hong Kong'];
const cache = new LRU({
	max: 6,
});
const iterations = 50000;
let misses = 0;

(async function () {
	// warmup
	await timer(withoutCache, 'Warmup without cache');

	// real deal
	await timer(withCache, 'With Cache');
	console.log(`${iterations - misses} cache hits out of ${iterations} attempts \n`);

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

			if (userFromDb) {
				cache.set(country, userFromDb);
				users.push(userFromDb);
				misses++;
			} else {
				console.log(`No user with a country of ${country}`);
			}
		}
	}

	return users;
}

async function withoutCache() {
	const users = [];

	for (let i = 0; i < iterations; i++) {
		const country = countries[Math.floor(Math.random() * countries.length)];
		const userFromDb = await User.findOne({ country });

		if (userFromDb) {
			users.push(userFromDb);
		} else {
			console.log(`No user with a country of ${country}`);
		}
	}

	return users;
}

async function timer(fn, id) {
	let start = process.hrtime();

	await fn();

	let stop = process.hrtime(start);

	console.log(`${id} execution time: ${(stop[0] * 1e9 + stop[1]) / 1e9} seconds\n`);
}
