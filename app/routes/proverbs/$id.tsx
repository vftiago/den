import { Proverb, Role } from "@prisma/client";
import {
	ActionFunction,
	json,
	LoaderFunction,
	MetaFunction,
	redirect,
} from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";

import { ProverbDisplay } from "~/components/proverb";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = ({
	data,
}: {
	data: LoaderData | undefined;
}) => ({
	title: "Proverbial Remix",
	description: data ? `"${data.proverb}"` : "Proverb not found.",
});

type LoaderData = { proverb: Proverb; canDelete: boolean };

export const loader: LoaderFunction = async ({ request, params }) => {
	const proverb = await db.proverb.findUnique({
		where: { id: params.id },
	});

	if (!proverb)
		throw new Response("Proverb not found.", {
			status: 404,
		});

	const userId = await getUserId(request);

	let user,
		canDelete = false;

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

		canDelete = isAdmin || isModerator || isOwner;
	}

	const data: LoaderData = {
		proverb,
		canDelete,
	};

	return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();

	if (form.get("_method") !== "delete") {
		throw new Response(`The _method ${form.get("_method")} is not supported`, {
			status: 400,
		});
	}
	const userId = await requireUserId(request);

	const proverb = await db.proverb.findUnique({
		where: { id: params.id },
	});

	if (!proverb) {
		throw new Response("Not found.", {
			status: 404,
		});
	}
	if (proverb.authorId !== userId) {
		throw new Response("That's not yours to delete.", {
			status: 401,
		});
	}
	await db.proverb.delete({ where: { id: params.id } });

	return redirect("/proverbs");
};

export default function ProverbRoute() {
	const data = useLoaderData<LoaderData>();

	return <ProverbDisplay proverb={data.proverb} canDelete={data.canDelete} />;
}

export function CatchBoundary() {
	const caught = useCatch();
	const params = useParams();

	switch (caught.status) {
		case 400: {
			return (
				<div className="error-container">
					What you're trying to do is not allowed.
				</div>
			);
		}
		case 404: {
			return <div className="error-container">{params.id} not found.</div>;
		}
		case 401: {
			return (
				<div className="error-container">
					Sorry, but {params.id} is not yours to delete.
				</div>
			);
		}
		default: {
			throw new Error(`Unhandled error: ${caught.status}`);
		}
	}
}

export function ErrorBoundary() {
	const { id } = useParams();
	return (
		<div className="error-container">{`There was an error loading proverb by the id ${id}. Sorry.`}</div>
	);
}
