import { Proverb, Role } from "@prisma/client";
import {
	json,
	LinksFunction,
	LoaderFunction,
	MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ProverbDisplay } from "~/components/proverb";

import stylesUrl from "~/styles/index.css";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export const links: LinksFunction = () => {
	return [{ rel: "stylesheet", href: stylesUrl }];
};

export const meta: MetaFunction = () => ({
	title: "Proverbial Remix",
	description: "The Proverbial Remix app.",
});

export type UserPermissions = {
	canDelete: boolean;
	canEdit: boolean;
};

export type LoaderData = { proverb: Proverb; userPermissions: UserPermissions };

export const loader: LoaderFunction = async ({ request }) => {
	const count = await db.proverb.count();
	const randomRowNumber = Math.floor(Math.random() * count);
	const [proverb] = await db.proverb.findMany({
		take: 1,
		skip: randomRowNumber,
	});

	if (!proverb) {
		throw new Response("Nothing found.", {
			status: 404,
		});
	}

	let user,
		canDelete = false,
		canEdit = false;

	const userId = await getUserId(request);

	if (userId) {
		user = await db.user.findUnique({
			where: { id: userId },
			select: { role: true },
		});

		if (!user)
			throw new Response(` User with id ${userId} not found.`, {
				status: 404,
			});

		const isAdmin = user.role === Role.ADMIN;
		const isModerator = user.role === Role.MODERATOR;
		const isOwner = userId === proverb.authorId;

		// implement user permission/role system
		canDelete = isAdmin || isModerator || isOwner;
		canEdit = isAdmin || isModerator || isOwner;
	}

	const data: LoaderData = {
		proverb,
		userPermissions: {
			canDelete,
			canEdit,
		},
	};

	return json(data);
};

export default function IndexRoute() {
	const data = useLoaderData<LoaderData>();

	return (
		<div className="container">
			<main className="content">
				<ProverbDisplay
					proverb={data.proverb}
					userPermissions={data.userPermissions}
				/>
			</main>
		</div>
	);
}
