import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

type LoaderData = {
	proverbListItems: Array<{ id: string; content: string }>;
};

export const loader: LoaderFunction = async () => {
	const proverbListItems = await db.proverb.findMany({
		take: 100,
		select: { id: true, content: true },
		orderBy: { content: "asc" },
	});

	const data: LoaderData = {
		proverbListItems,
	};

	return json(data);
};

export default function ProverbsIndexRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div>
			<ul className="proverb-list">
				{data.proverbListItems.map((proverb) => (
					<li key={proverb.id}>
						<Link to={proverb.id}>{proverb.content}</Link>
					</li>
				))}
			</ul>
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
