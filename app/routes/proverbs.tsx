import type { LinksFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import stylesUrl from "~/styles/proverbs.css";

export const links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: stylesUrl }];
};

export default function ProverbsRoute() {
	return (
		<div className="container">
			<main className="content">
				<div className="">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
