import { Proverb } from "@prisma/client";
import {
	json,
	LinksFunction,
	LoaderFunction,
	MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import stylesUrl from "~/styles/index.css";
import { db } from "~/utils/db.server";

export const links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: stylesUrl }];
};

export const meta: MetaFunction = () => ({
	title: "Proverbial Remix",
	description: "The Proverbial Remix app.",
});

type LoaderData = {
	randomProverb: Proverb;
};

export const loader: LoaderFunction = async () => {
	const count = await db.proverb.count();
	const randomRowNumber = Math.floor(Math.random() * count);
	const [randomProverb] = await db.proverb.findMany({
		take: 1,
		skip: randomRowNumber,
	});
	if (!randomProverb) {
		throw new Response("Nothing found.", {
			status: 404,
		});
	}

	const data: LoaderData = { randomProverb };
	return json(data);
};

export default function IndexRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div className="container">
			<main className="content">
				<Link to=".">{data.randomProverb.content}</Link>
			</main>
		</div>
	);
}
