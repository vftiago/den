import { Proverb, Role } from "@prisma/client";
import {
	ActionFunction,
	json,
	LoaderFunction,
	MetaFunction,
	redirect,
} from "@remix-run/node";
import {
	useActionData,
	useCatch,
	useLoaderData,
	useParams,
} from "@remix-run/react";

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

type UserPermissions = {
	canDelete: boolean;
	canEdit: boolean;
};

type LoaderData = { proverb: Proverb; userPermissions: UserPermissions };

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
		canDelete = false,
		canEdit = false;

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

// TODO extract duplicate types and helper functions
type ActionData = {
	formError?: string;
	fieldErrors?: {
		content: string | undefined;
	};
	fields?: {
		content: string;
		language: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

function validateProverbContent(content: string) {
	if (content.length < 10) {
		return `Proverbs must have at least 10 characters.`;
	}
}

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();

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

	const method = form.get("_method");

	switch (method) {
		case "put":
			const content = form.get("content");
			const language = form.get("language");

			if (typeof content !== "string" || typeof language !== "string") {
				return badRequest({
					formError: `Form not submitted correctly.`,
				});
			}

			const fields = { content, language };

			const fieldErrors = {
				content: validateProverbContent(content),
			};

			if (Object.values(fieldErrors).some(Boolean)) {
				return badRequest({ fieldErrors, fields });
			}

			await db.proverb.update({
				where: { id: params.id },
				data: {
					content,
					language,
				},
			});

			return redirect("/proverbs");

		case "delete":
			await db.proverb.delete({ where: { id: params.id } });

			return redirect("/proverbs");

		default:
			throw new Response(
				`The _method ${form.get("_method")} is not supported`,
				{
					status: 400,
				},
			);
	}
};

export default function ProverbRoute() {
	const data = useLoaderData<LoaderData>();
	const actionData = useActionData<ActionData>();

	return (
		<ProverbDisplay
			proverb={data.proverb}
			userPermissions={data.userPermissions}
			actionData={actionData}
		/>
	);
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
