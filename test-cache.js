const db = require('./config/connection');
const LRU = require('lru-cache');
const options = {
	max: 2,
};
const cache = new LRU(options);
const { User } = require('./models');
const countries = ['Armenia', 'Afghanistan', 'Romania'];
const users = [];

(async function () {
	await withCache();
})();

async function withCache() {
	for (let i = 0; i < 1000; i++) {
		const country = countries[i % 3];
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
