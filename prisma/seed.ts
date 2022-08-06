import { PrismaClient } from "@prisma/client";
import * as pt from "../data/pt.json";

const db = new PrismaClient();

async function seed() {
	const seedUser = await db.user.create({
		data: {
			username: "seed-user",
			passwordHash:
				"$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u",
		},
	});

	await Promise.all(
		getProverbs().map((proverb) => {
			const data = {
				authorId: seedUser.id,
				...proverb,
			};
			return db.proverb.create({ data });
		}),
	);
}

seed();

function getProverbs() {
	return pt.map((proverb) => {
		return {
			content: proverb,
			language: "pt",
			baseColor: "red",
		};
	});
}
