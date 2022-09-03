import {
	json,
	LinksFunction,
	LoaderFunction,
	MetaFunction,
} from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	useCatch,
	useLoaderData,
} from "@remix-run/react";
import { Header } from "./components/header";

import globalLargeStylesUrl from "./styles/global-large.css";
import globalMediumStylesUrl from "./styles/global-medium.css";
import globalStylesUrl from "./styles/global.css";
import { getUser } from "./utils/session.server";

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
};

export const links: LinksFunction = () => {
	return [
		{
			rel: "stylesheet",
			href: globalStylesUrl,
		},
		{
			rel: "stylesheet",
			href: globalMediumStylesUrl,
			media: "print, (min-width: 640px)",
		},
		{
			rel: "stylesheet",
			href: globalLargeStylesUrl,
			media: "screen and (min-width: 1024px)",
		},
	];
};

export const meta: MetaFunction = () => {
	const description = "The Proverbial Remix app.";

	return {
		"charset": "utf-8",
		description,
		"keywords": "Remix,proverbs",
		// "twitter:image": "",
		// "twitter:card": "summary_large_image",
		// "twitter:creator": "@remix_run",
		// "twitter:site": "@remix_run",
		"twitter:title": "Proverbial Remix",
		"twitter:description": description,
	};
};

export const loader: LoaderFunction = async ({ request }) => {
	const user = await getUser(request);

	const data: LoaderData = {
		user,
	};

	return json(data);
};

function Document({
	children,
	title = `Proverbial Remix`,
}: {
	children: React.ReactNode;
	title?: string;
}) {
	return (
		<html lang="en">
			<head>
				<Meta />
				<title>{title}</title>
				<Links />
			</head>
			<body>
				{children}
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

export default function App() {
	const data = useLoaderData<LoaderData>();

	return (
		<Document>
			<Header username={data.user?.username} />
			<Outlet />
		</Document>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	return (
		<Document title={`${caught.status} ${caught.statusText}`}>
			<div className="error-container">
				<h1>
					{caught.status} {caught.statusText}
				</h1>
			</div>
		</Document>
	);
}

export function ErrorBoundary({ error }: { error: Error }) {
	console.error(error);

	return (
		<Document title="Uh-oh!">
			<div className="error-container">
				<h1>App Error</h1>
				<pre>{error.message}</pre>
			</div>
		</Document>
	);
}
