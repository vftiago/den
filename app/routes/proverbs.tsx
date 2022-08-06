import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";

import stylesUrl from "~/styles/proverbs.css";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: stylesUrl }];
};

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
	proverbListItems: Array<{ id: string; content: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
	const proverbListItems = await db.proverb.findMany({
		take: 5,
		select: { id: true, content: true },
		orderBy: { createdAt: "desc" },
	});

	const user = await getUser(request);

	const data: LoaderData = {
		proverbListItems,
		user,
	};

	return json(data);
};

export default function ProverbsRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div className="proverbs-layout">
			<header className="proverbs-header">
				<div className="container">
					<h1 className="home-link">
						<Link
							prefetch="intent"
							to="/"
							title="Remix Proverbs"
							aria-label="Remix Proverbs"
						>
							<span className="logo-medium">Proverbs</span>
						</Link>
					</h1>
					{data.user ? (
						<div className="user-info">
							<span>{`Hi ${data.user.username}`}</span>
							<Form action="/logout" method="post">
								<button type="submit" className="button">
									Logout
								</button>
							</Form>
						</div>
					) : (
						<Link to="/login">Login</Link>
					)}
				</div>
			</header>
			<main className="proverbs-main">
				<div className="container">
					<div className="proverbs-list">
						<Link to=".">Get a random proverb</Link>
						<p>Here are a few more proverbs to check out:</p>
						<ul>
							{data.proverbListItems.map((proverb) => (
								<li key={proverb.id}>
									<Link to={proverb.id}>{proverb.content}</Link>
								</li>
							))}
						</ul>
						<Link to="new" className="button">
							Add your own
						</Link>
					</div>
					<div className="proverbs-outlet">
						<Outlet />
					</div>
				</div>
			</main>
		</div>
	);
}
