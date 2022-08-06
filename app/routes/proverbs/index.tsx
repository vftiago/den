import type { Proverb } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

type LoaderData = { randomProverb: Proverb };

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

export default function ProverbsIndexRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div>
			<p>Here's a random proverb:</p>
			<p>{data.randomProverb.content}</p>
			<Link to={data.randomProverb.id}>
				"{data.randomProverb.content}" Permalink
			</Link>
		</div>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	if (caught.status === 404) {
		return (
			<div className="error-container">There are no proverbs to display.</div>
		);
	}
	throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
	return <div className="error-container">I did a whoopsies.</div>;
}
