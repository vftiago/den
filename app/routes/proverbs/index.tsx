import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

const PAGE_SIZE = 25;

type LoaderData = {
	currentPage: number;
	proverbListItems: Array<{ id: string; content: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
	let proverbListItems;

	const url = new URL(request.url);

	// page 1 is loaded by default
	const currentPage = Number(url.searchParams.get("page") || "1");

	const skip = (currentPage - 1) * PAGE_SIZE;

	proverbListItems = await db.proverb.findMany({
		skip,
		take: PAGE_SIZE,
		select: { id: true, content: true },
		orderBy: { content: "asc" },
	});

	const data: LoaderData = {
		currentPage,
		proverbListItems,
	};

	return json(data);
};

export default function ProverbsIndexRoute() {
	const data = useLoaderData<LoaderData>();

	const { currentPage, proverbListItems } = data;

	return (
		<div>
			<ul className="proverb-list">
				{proverbListItems.map((proverb) => (
					<li key={proverb.id}>
						<Link to={proverb.id}>{proverb.content}</Link>
					</li>
				))}
			</ul>
			{Number(currentPage) > 1 && (
				<Link to={`?page=${currentPage - 1}`}>Previous page</Link>
			)}
			<Link to={`?page=${currentPage + 1}`}>Next page</Link>
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
